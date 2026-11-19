import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { convertToMarkdown } from 'mammoth';
import { ApiError } from '../../../shared/errors.js';

// Text extraction and normalization for uploaded resumes.
//
// The normalized text is what the AI pipeline sees and what we persist. The
// binary is never stored and never sent to a model.

const MAX_STORED_CHARACTERS = 120_000;

// A page with fewer characters than this is treated as having no text layer,
// which is what a scanned (image-only) PDF looks like after extraction.
const MIN_CHARACTERS_PER_PAGE = 40;

const BULLET_PATTERN = /^\s*[•▪◦‣∙·*-]\s+/;
const NUMBERED_PATTERN = /^\s*\d{1,2}[.)]\s+/;

/** Collapse the noise PDF and DOCX converters leave behind. */
export function normalizeDocumentText(raw) {
  const text = String(raw ?? '')
    // Some converters emit form feeds and vertical tabs as page separators.
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .replace(/\u00a0/g, ' ')
    // Soft hyphens and zero-width characters only confuse the model.
    .replace(/[\u00ad\u200b\u200c\u200d\u2060\ufeff]/g, '')
    .replace(/\t/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \u00a0]{2,}/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text.slice(0, MAX_STORED_CHARACTERS);
}

function countWords(text) {
  const matches = text.match(/\S+/g);
  return matches ? matches.length : 0;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Rebuild readable lines from pdf.js text items.
 *
 * Text items arrive in content-stream order with coordinates, so grouping by
 * y and sorting by x recovers the visual line order. Font height is used to
 * recognise headings, and leading bullet glyphs are normalized so section
 * structure survives into the prompt.
 */
function pageToLines(items) {
  const lines = [];

  for (const item of items) {
    const str = typeof item.str === 'string' ? item.str : '';
    if (!str.trim()) continue;

    const [, , , scaleY, x, y] = item.transform ?? [];
    const fontSize = Math.abs(scaleY) || item.height || 0;
    const width = item.width ?? 0;

    const line = lines.find((candidate) => Math.abs(candidate.y - y) <= 2.5);
    if (line) {
      line.items.push({ str, x, width, fontSize });
    } else {
      lines.push({ y, items: [{ str, x, width, fontSize }] });
    }
  }

  const pageFontSize = median(lines.flatMap((line) => line.items.map((item) => item.fontSize)));

  return lines.map((line) => {
    const items = [...line.items].sort((a, b) => a.x - b.x);
    const fontSize = Math.max(...items.map((item) => item.fontSize));

    let text = '';
    let lastRight = null;
    for (const item of items) {
      const spaceWidth = Math.max(item.fontSize, 1) * 0.28;
      if (lastRight !== null) {
        const gap = item.x - lastRight;
        if (gap > spaceWidth && !/\s$/.test(text) && !/^\s/.test(item.str)) text += ' ';
      }
      text += item.str;
      lastRight = item.x + (item.width || item.str.length * item.fontSize * 0.5);
    }

    return { text: text.replace(/\s{2,}/g, ' ').trim(), fontSize };
  }).filter((line) => line.text).map((line) => {
    const isHeading =
      pageFontSize > 0 &&
      line.fontSize >= pageFontSize * 1.16 &&
      line.text.length <= 90 &&
      !/[.,;:]$/.test(line.text);

    if (isHeading) return `## ${line.text.replace(/^#+\s*/, '')}`;
    if (BULLET_PATTERN.test(line.text)) return `- ${line.text.replace(BULLET_PATTERN, '')}`;
    return line.text;
  });
}

async function extractPdf(buffer) {
  let document;
  try {
    document = await getDocument({
      // pdf.js takes ownership of the array, so hand it a copy of the bytes.
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      useSystemFonts: false,
      disableFontFace: true,
      verbosity: 0,
    }).promise;
  } catch (error) {
    if (error?.name === 'PasswordException') {
      throw new ApiError(422, 'This PDF is password protected. Remove the password and upload it again.');
    }
    throw new ApiError(422, 'This PDF could not be read. It may be corrupted — try exporting it again.');
  }

  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(pageToLines(content.items ?? []).join('\n'));
      page.cleanup();
    }
  } catch {
    throw new ApiError(422, 'This PDF could not be read past the opening pages. It may be corrupted.');
  } finally {
    await document.destroy().catch(() => {});
  }

  return {
    text: pages.filter(Boolean).join('\n\n'),
    pageCount: document.numPages || pages.length,
  };
}

function cleanMarkdown(markdown) {
  return String(markdown ?? '')
    // Images and links carry no resume content; keep the link text only.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    // Mammoth emits "## " for headings; keep exactly one level of marker.
    .replace(/^#{3,}\s*/gm, '## ')
    // Markdown escapes (e.g. "jane@example\.com") are noise for the model.
    .replace(/\\([\\`*_{}[\]()#+\-.!|>~])/g, '$1')
    .replace(/^\s*[*+]\s+/gm, '- ');
}

async function extractDocx(buffer) {
  let result;
  try {
    result = await convertToMarkdown({ buffer });
  } catch {
    throw new ApiError(422, 'This DOCX file could not be read. It may be corrupted or password protected.');
  }
  return { text: cleanMarkdown(result.value), pageCount: 0 };
}

/** Extract text and measurements from an uploaded PDF or DOCX document. */
async function readDocument({ buffer, format }) {
  const extracted = format === 'pdf' ? await extractPdf(buffer) : await extractDocx(buffer);
  const text = normalizeDocumentText(extracted.text);
  const characters = text.length;
  const words = countWords(text);
  const pageCount = extracted.pageCount;

  if (characters === 0) {
    throw new ApiError(
      422,
      format === 'pdf'
        ? 'No text could be extracted from this PDF. It looks like a scanned image — upload a PDF exported from your editor, or a DOCX file.'
        : 'No text could be extracted from this DOCX file. Check that the document is not empty and upload it again.'
    );
  }

  const scanned =
    format === 'pdf' &&
    pageCount > 0 &&
    characters / pageCount < MIN_CHARACTERS_PER_PAGE;

  if (scanned) {
    throw new ApiError(
      422,
      'This PDF has no text layer, which usually means it was scanned or exported as images. Upload a text-based PDF or the original DOCX.'
    );
  }

  return { text, pages: pageCount, characters, words };
}

/**
 * Extract normalized text from a validated resume upload.
 *
 * Returns the text plus the measurements the UI and the pipeline need. Throws
 * ApiError with a user-facing message when the document cannot be used, so the
 * caller can respond before any AI work is queued.
 */
export async function extractResumeText({ buffer, format }) {
  const result = await readDocument({ buffer, format });

  if (result.words < 30) {
    throw new ApiError(
      422,
      'This resume is too short to analyse. Upload a document with your experience, projects and skills.'
    );
  }

  return result;
}

/** Job descriptions are read with the same parsers, without the resume checks. */
export async function extractJobDescriptionText({ buffer, format }) {
  return readDocument({ buffer, format });
}

/** Resume text pasted into the form, measured like an upload. */
export function extractPastedResumeText(raw) {
  const text = normalizeDocumentText(raw);
  const words = countWords(text);

  if (!words) {
    throw new ApiError(400, 'Paste your resume text or attach a PDF or DOCX file.');
  }
  if (words < 30) {
    throw new ApiError(
      422,
      'That resume text is too short to analyse. Paste your experience, projects and skills.'
    );
  }

  return { text, pages: 0, characters: text.length, words };
}

/** Trim text to a prompt budget without cutting a line in half. */
export function prepareTextForModel(text, maxCharacters) {
  const source = String(text ?? '');
  if (source.length <= maxCharacters) return { text: source, truncated: false };

  const cut = source.slice(0, maxCharacters);
  const lastBreak = cut.lastIndexOf('\n');
  const body = lastBreak > maxCharacters * 0.7 ? cut.slice(0, lastBreak) : cut;

  return {
    text: `${body}\n\n[Document truncated: ${source.length - body.length} further characters were not included.]`,
    truncated: true,
  };
}
