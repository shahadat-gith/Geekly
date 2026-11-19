import { load } from 'cheerio';

// Canonical article document helpers for the API. The client never sends HTML
// as article content: it sends Tiptap JSON, which is validated here and then
// serialised into the optional HTML cache used by simple consumers.

const MAX_ANNOTATION_CONTENT = 2_000;
const ANNOTATION_KINDS = ['explanation', 'definition', 'context', 'source'];
const CALLOUT_KINDS = ['info', 'warning', 'success', 'error'];
const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const IMAGE_ALIGNMENTS = ['left', 'center', 'right'];

const BLOCK_NODES = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
  'horizontalRule',
  'articleImage',
  'articleDiagram',
  'callout',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
]);
const MARK_NAMES = new Set([
  'bold', 'italic', 'underline', 'strike', 'code', 'link', 'highlight', 'annotation',
]);

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value, max = Infinity) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function safeUrl(value, { allowMail = false } = {}) {
  const raw = cleanString(value, 2_048).trim();
  if (!raw) return '';
  if (raw.startsWith('/') || raw.startsWith('#')) return raw;
  try {
    const url = new URL(raw);
    const protocols = allowMail ? ['http:', 'https:', 'mailto:', 'tel:'] : ['http:', 'https:'];
    return protocols.includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function createAnnotationId() {
  const random =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `ann_${random}`;
}

function normalizeAnnotationKind(value) {
  return ANNOTATION_KINDS.includes(value) ? value : 'explanation';
}

function normalizeTextAlign(value) {
  return TEXT_ALIGNMENTS.includes(value) ? value : null;
}

function normalizeImageAlign(value) {
  return IMAGE_ALIGNMENTS.includes(value) ? value : 'center';
}

function cleanAssetKey(value) {
  return cleanString(value, 512).trim().replace(/[^a-zA-Z0-9/_.-]/g, '');
}

function cleanDiagramId(value) {
  return cleanString(value, 64).replace(/[^a-zA-Z0-9_-]/g, '');
}

function sanitizeArticleImageAttrs(node) {
  const attrs = { align: normalizeImageAlign(node.attrs?.align) };
  const assetKey = cleanAssetKey(node.attrs?.assetKey);
  const assetUrl = safeUrl(node.attrs?.assetUrl);
  const alt = cleanString(node.attrs?.alt, 500).trim();
  const caption = cleanString(node.attrs?.caption, 500).trim();
  if (assetKey) attrs.assetKey = assetKey;
  if (assetUrl) attrs.assetUrl = assetUrl;
  if (alt) attrs.alt = alt;
  if (caption) attrs.caption = caption;
  return attrs;
}

function sanitizeArticleDiagramAttrs(node) {
  const diagramId = cleanDiagramId(node.attrs?.diagramId);
  if (!diagramId) return null;

  const attrs = { diagramId };
  const assetKey = cleanAssetKey(node.attrs?.assetKey);
  const assetUrl = safeUrl(node.attrs?.assetUrl);
  const alt = cleanString(node.attrs?.alt, 500).trim();
  const caption = cleanString(node.attrs?.caption, 500).trim();
  if (assetKey) attrs.assetKey = assetKey;
  if (assetUrl) attrs.assetUrl = assetUrl;
  if (alt) attrs.alt = alt;
  if (caption) attrs.caption = caption;
  return attrs;
}

function normalizeCalloutKind(value) {
  return CALLOUT_KINDS.includes(value) ? value : 'info';
}

function sanitizeAnnotationMark(mark, state) {
  const content = cleanString(mark.attrs?.content, MAX_ANNOTATION_CONTENT).trim();
  if (!content) return null;

  const kind = normalizeAnnotationKind(mark.attrs?.kind);
  let id = /^ann_[a-zA-Z0-9_-]{1,80}$/.test(cleanString(mark.attrs?.id, 84))
    ? cleanString(mark.attrs?.id, 84)
    : '';
  if (!id) id = createAnnotationId();

  const existing = state.annotations.get(id);
  if (existing && (existing.kind !== kind || existing.content !== content)) {
    do {
      id = createAnnotationId();
    } while (state.annotations.has(id));
  }
  if (!state.annotations.has(id)) state.annotations.set(id, { kind, content });

  return { type: 'annotation', attrs: { id, kind, content } };
}

function sanitizeMarks(marks, state) {
  if (!Array.isArray(marks)) return [];
  const seen = new Set();
  const result = [];

  for (const mark of marks) {
    if (!isObject(mark) || !MARK_NAMES.has(mark.type) || seen.has(mark.type)) continue;

    if (mark.type === 'link') {
      const href = safeUrl(mark.attrs?.href, { allowMail: true });
      if (!href) continue;
      seen.add('link');
      result.push({
        type: 'link',
        attrs: {
          href,
          ...(mark.attrs?.target === '_blank' || mark.attrs?.target === '_self'
            ? { target: mark.attrs.target }
            : {}),
          rel: 'noopener noreferrer nofollow',
        },
      });
      continue;
    }

    if (mark.type === 'annotation') {
      const annotation = sanitizeAnnotationMark(mark, state);
      if (!annotation) continue;
      seen.add('annotation');
      result.push(annotation);
      continue;
    }

    seen.add(mark.type);
    result.push({ type: mark.type });
  }

  return result;
}

function sanitizeInlineContent(content, state) {
  if (!Array.isArray(content)) return [];
  const result = [];

  for (const node of content) {
    if (!isObject(node)) continue;
    if (node.type === 'hardBreak') {
      result.push({ type: 'hardBreak' });
      continue;
    }

    if (node.type !== 'text') continue;
    const text = cleanString(node.text);
    if (!text) continue;
    const marks = sanitizeMarks(node.marks, state);
    result.push({
      type: 'text',
      text,
      ...(marks.length ? { marks } : {}),
    });
  }

  return result;
}

function sanitizeCellAttrs(node) {
  const attrs = {};
  const colspan = Number.parseInt(node.attrs?.colspan, 10);
  const rowspan = Number.parseInt(node.attrs?.rowspan, 10);
  if (Number.isFinite(colspan) && colspan > 1) attrs.colspan = Math.min(colspan, 20);
  if (Number.isFinite(rowspan) && rowspan > 1) attrs.rowspan = Math.min(rowspan, 20);
  if (Array.isArray(node.attrs?.colwidth)) {
    attrs.colwidth = node.attrs.colwidth
      .slice(0, 20)
      .map((width) => Math.min(Math.max(Number(width) || 0, 0), 2_000));
  }
  return attrs;
}

function sanitizeBlockNode(node, state) {
  if (!isObject(node) || !BLOCK_NODES.has(node.type)) return null;

  const children = () =>
    Array.isArray(node.content)
      ? node.content
          .map((child) => sanitizeBlockNode(child, state))
          .filter(Boolean)
      : [];

  if (node.type === 'paragraph' || node.type === 'heading') {
    const attrs = {};
    if (node.type === 'heading') {
      attrs.level = Math.min(Math.max(Number.parseInt(node.attrs?.level, 10) || 2, 1), 6);
    }
    const align = normalizeTextAlign(node.attrs?.textAlign);
    if (align) attrs.textAlign = align;
    return {
      type: node.type,
      ...(Object.keys(attrs).length ? { attrs } : {}),
      content: sanitizeInlineContent(node.content, state),
    };
  }

  if (node.type === 'codeBlock') {
    const text = (node.content || [])
      .filter((child) => child?.type === 'text')
      .map((child) => child.text || '')
      .join('');
    const language = cleanString(node.attrs?.language, 30)
      .toLowerCase()
      .replace(/[^a-z0-9+#.-]/g, '');
    return {
      type: 'codeBlock',
      attrs: language ? { language } : {},
      content: text ? [{ type: 'text', text }] : [],
    };
  }

  if (node.type === 'blockquote') {
    const content = children();
    return { type: 'blockquote', content: content.length ? content : [{ type: 'paragraph' }] };
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    const items = (node.content || [])
      .filter((child) => child?.type === 'listItem')
      .map((child) => sanitizeBlockNode(child, state))
      .filter(Boolean);
    const attrs = {};
    if (node.type === 'orderedList') {
      const start = Number.parseInt(node.attrs?.start, 10);
      if (Number.isFinite(start) && start > 1) attrs.start = Math.min(start, 100_000);
    }
    if (!items.length) return null;
    return { type: node.type, ...(Object.keys(attrs).length ? { attrs } : {}), content: items };
  }

  if (node.type === 'listItem') {
    const content = children();
    if (!content.length || content[0].type !== 'paragraph') {
      content.unshift({ type: 'paragraph' });
    }
    return { type: 'listItem', content };
  }
  if (node.type === 'horizontalRule') return { type: 'horizontalRule' };

  if (node.type === 'articleImage') {
    return {
      type: 'articleImage',
      attrs: sanitizeArticleImageAttrs(node),
    };
  }

  if (node.type === 'articleDiagram') {
    const attrs = sanitizeArticleDiagramAttrs(node);
    return attrs ? { type: 'articleDiagram', attrs } : null;
  }

  if (node.type === 'callout') {
    const content = children();
    return {
      type: 'callout',
      attrs: { kind: normalizeCalloutKind(node.attrs?.kind) },
      content: content.length ? content : [{ type: 'paragraph' }],
    };
  }

  if (node.type === 'table') {
    if (!Array.isArray(node.content) || !node.content.some((child) => child?.type === 'tableRow')) {
      return null;
    }
    const rows = (node.content || [])
      .filter((child) => child?.type === 'tableRow')
      .map((row) => sanitizeBlockNode(row, state))
      .filter(Boolean);
    return rows.length ? { type: 'table', content: rows } : null;
  }

  if (node.type === 'tableRow') {
    const cells = (node.content || [])
      .filter((child) => child?.type === 'tableHeader' || child?.type === 'tableCell')
      .map((cell) => sanitizeBlockNode(cell, state))
      .filter(Boolean);
    return cells.length ? { type: 'tableRow', content: cells } : null;
  }

  if (node.type === 'tableHeader' || node.type === 'tableCell') {
    const content = children();
    return {
      type: node.type,
      attrs: sanitizeCellAttrs(node),
      content: content.length ? content : [{ type: 'paragraph' }],
    };
  }

  return null;
}

/** Validate and normalise a Tiptap JSON document for storage and rendering. */
export function sanitizeArticleDoc(value) {
  if (!isObject(value) || value.type !== 'doc' || !Array.isArray(value.content)) return null;
  const state = { annotations: new Map() };
  const content = value.content
    .map((node) => sanitizeBlockNode(node, state))
    .filter(Boolean);
  return { type: 'doc', content };
}

function isArticleDoc(value) {
  return isObject(value) && value.type === 'doc' && Array.isArray(value.content);
}

export function articleDocDiagramIds(doc) {
  const ids = new Set();
  const visit = (node) => {
    if (!node) return;
    if (node.type === 'articleDiagram' && node.attrs?.diagramId) {
      ids.add(String(node.attrs.diagramId));
    }
    (node.content || []).forEach(visit);
  };
  visit(doc);
  return ids;
}

export function articleDocAssetKeys(doc) {
  const keys = [];
  const visit = (node) => {
    if (!node) return;
    if (
      (node.type === 'articleImage' || node.type === 'articleDiagram') &&
      node.attrs?.assetKey
    ) {
      keys.push(String(node.attrs.assetKey));
    }
    (node.content || []).forEach(visit);
  };
  visit(doc);
  return [...new Set(keys.filter(Boolean))];
}

export function articleDocText(doc) {
  const parts = [];
  const visit = (node) => {
    if (!node) return;
    if (node.type === 'text') {
      parts.push(String(node.text || ''));
      return;
    }
    if (node.type === 'hardBreak') {
      parts.push(' ');
      return;
    }
    if (node.type === 'codeBlock') {
      parts.push(...(node.content || []).map((child) => child?.text || ''), ' ');
      return;
    }
    if (node.type === 'articleImage' || node.type === 'articleDiagram') {
      parts.push(' ');
      return;
    }
    (node.content || []).forEach(visit);
    if (BLOCK_NODES.has(node.type)) parts.push(' ');
  };
  visit(doc);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

export function articleDocHasContent(doc) {
  if (!isArticleDoc(doc)) return false;
  if (articleDocText(doc)) return true;
  let found = false;
  const visit = (node) => {
    if (!node || found) return;
    if (node.type === 'articleImage' || node.type === 'articleDiagram' || node.type === 'horizontalRule') {
      found = true;
      return;
    }
    (node.content || []).forEach(visit);
  };
  visit(doc);
  return found;
}

// --------------------------------------------------------------------------
// AI draft conversion: the model returns a constrained HTML subset, so turn it
// into the same Tiptap JSON shape the editor and reader use.
// --------------------------------------------------------------------------

const BLOCK_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
  'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'figure',
]);

function mergeMarks(parent = [], child = []) {
  const seen = new Set();
  return [...parent, ...child].filter((mark) => {
    if (!mark || seen.has(mark.type)) return false;
    seen.add(mark.type);
    return true;
  });
}

function marksForElement($, element) {
  const tag = element.tagName?.toLowerCase();
  if (tag === 'strong' || tag === 'b') return [{ type: 'bold' }];
  if (tag === 'em' || tag === 'i') return [{ type: 'italic' }];
  if (tag === 'u') return [{ type: 'underline' }];
  if (tag === 's' || tag === 'strike' || tag === 'del') return [{ type: 'strike' }];
  if (tag === 'mark') return [{ type: 'highlight' }];
  if (tag === 'code') return [{ type: 'code' }];
  if (tag === 'a') {
    const href = safeUrl($(element).attr('href'), { allowMail: true });
    return href ? [{ type: 'link', attrs: { href, rel: 'noopener noreferrer nofollow' } }] : [];
  }
  if (tag === 'span' && $(element).attr('data-annotation-id')) {
    const content = cleanString($(element).attr('data-annotation-content'), MAX_ANNOTATION_CONTENT).trim();
    if (!content) return [];
    return [{
      type: 'annotation',
      attrs: {
        id: $(element).attr('data-annotation-id'),
        kind: normalizeAnnotationKind($(element).attr('data-annotation-kind')),
        content,
      },
    }];
  }
  return [];
}

function inlineFromNode($, node, inherited = []) {
  if (node.type === 'text') {
    return [{ type: 'text', text: node.data, ...(inherited.length ? { marks: inherited } : {}) }];
  }
  if (node.type !== 'tag') return [];

  const tag = node.tagName?.toLowerCase();
  if (tag === 'br') return [{ type: 'hardBreak' }];
  if (BLOCK_TAGS.has(tag)) return [];

  const marks = mergeMarks(inherited, marksForElement($, node));
  return $(node).contents().toArray().flatMap((child) => inlineFromNode($, child, marks));
}

function paragraphFromInline($, node) {
  return { type: 'paragraph', content: $(node).contents().toArray().flatMap((child) => inlineFromNode($, child)) };
}

function blocksFromChildren($, node) {
  const blocks = [];
  let inline = [];

  function flushInline() {
    if (!inline.length) return;
    const hasContent = inline.some((item) => item.type !== 'text' || String(item.text || '').trim());
    if (hasContent) blocks.push({ type: 'paragraph', content: inline });
    inline = [];
  }

  $(node).contents().toArray().forEach((child) => {
    if (child.type === 'tag' && BLOCK_TAGS.has(child.tagName?.toLowerCase())) {
      flushInline();
      blocks.push(...blocksFromElement($, child));
      return;
    }
    if (child.type === 'text' && !String(child.data || '').trim() && !inline.length) return;
    inline.push(...inlineFromNode($, child));
  });
  flushInline();
  return blocks;
}

function tableFromElement($, node) {
  const rows = $(node).find('tr').toArray().map((row) => {
    const cells = $(row).children('th,td').toArray().map((cell) => ({
      type: cell.tagName?.toLowerCase() === 'th' ? 'tableHeader' : 'tableCell',
      content: [{ type: 'paragraph', content: $(cell).contents().toArray().flatMap((child) => inlineFromNode($, child)) }],
    }));
    return { type: 'tableRow', content: cells };
  });
  return { type: 'table', content: rows };
}

function blocksFromElement($, node) {
  const tag = node.tagName?.toLowerCase();

  if (/^h[1-6]$/.test(tag)) {
    return [{
      type: 'heading',
      attrs: { level: Number(tag[1]) },
      content: $(node).contents().toArray().flatMap((child) => inlineFromNode($, child)),
    }];
  }
  if (tag === 'p') return [paragraphFromInline($, node)];
  if (tag === 'blockquote') return [{ type: 'blockquote', content: blocksFromChildren($, node) }];
  if (tag === 'ul' || tag === 'ol') {
    const items = $(node).children('li').toArray().map((item) => {
      const content = blocksFromChildren($, item);
      return { type: 'listItem', content: content.length ? content : [{ type: 'paragraph' }] };
    });
    const attrs = {};
    if (tag === 'ol') {
      const start = Number.parseInt($(node).attr('start'), 10);
      if (Number.isFinite(start) && start > 1) attrs.start = start;
    }
    return [{ type: tag === 'ul' ? 'bulletList' : 'orderedList', ...(Object.keys(attrs).length ? { attrs } : {}), content: items }];
  }
  if (tag === 'pre') {
    const code = $(node).find('code').first();
    const text = (code.length ? code.text() : $(node).text()).replace(/\n$/, '');
    const language = (code.attr('class') || '').match(/language-([a-z0-9+#.-]+)/i)?.[1]?.toLowerCase();
    return [{
      type: 'codeBlock',
      ...(language ? { attrs: { language } } : {}),
      content: text ? [{ type: 'text', text }] : [],
    }];
  }
  if (tag === 'hr') return [{ type: 'horizontalRule' }];
  if (tag === 'figure' && $(node).attr('data-article-diagram')) {
    const attrs = sanitizeArticleDiagramAttrs({
      attrs: { diagramId: $(node).attr('data-article-diagram') },
    });
    return attrs ? [{ type: 'articleDiagram', attrs }] : [];
  }
  if (
    tag === 'figure' &&
    ($(node).attr('data-article-image') !== undefined || $(node).attr('data-article-media'))
  ) {
    return [{ type: 'articleImage', attrs: { align: 'center' } }];
  }
  if (tag === 'table') return [tableFromElement($, node)];
  if (tag === 'div' && $(node).attr('data-callout')) {
    const content = blocksFromChildren($, node).filter(
      (block) => !(block.type === 'paragraph' && /^(info|warning|success|error)\b/i.test(articleDocText(block))),
    );
    return [{
      type: 'callout',
      attrs: { kind: normalizeCalloutKind($(node).attr('data-callout')) },
      content: content.length ? content : [{ type: 'paragraph' }],
    }];
  }
  return blocksFromChildren($, node);
}

/** Convert the constrained HTML returned by the AI writer into Tiptap JSON. */
export function htmlToArticleDoc(html) {
  const source = String(html ?? '').trim();
  if (!source) return null;
  const $ = load(source, null, false);
  const blocks = blocksFromChildren($, $.root());
  return sanitizeArticleDoc({ type: 'doc', content: blocks });
}
