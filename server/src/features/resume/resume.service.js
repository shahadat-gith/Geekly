import ResumeAnalysis from '../../models/ResumeAnalysis.js';
import { ApiError } from '../../shared/errors.js';
import { toObjectId } from '../../shared/validation.js';
import { validateResumeFile } from './documents/validate.js';
import {
  extractJobDescriptionText,
  extractPastedResumeText,
  extractResumeText,
} from './documents/extract.js';
import { enqueueResumeJob } from '../../jobs/resume/publisher.js';

// All reads and writes go through the signed-in user. A document that belongs
// to someone else is reported as missing, not forbidden, so ids cannot be
// probed.

const MAX_JOB_DESCRIPTION = 20_000;
const MAX_INSTRUCTIONS = 2_000;

const LIST_FIELDS =
  'status stage error createdAt completedAt companyDetails document ' +
  'analysis.version analysis.summary';

function cleanJobDescription(value) {
  const text = String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim();

  if (text.length < 60) {
    throw new ApiError(
      400,
      'Paste the job description (at least a few lines) so the resume can be compared with it.'
    );
  }
  if (text.length > MAX_JOB_DESCRIPTION) {
    throw new ApiError(
      400,
      `That job description is too long. Keep it under ${MAX_JOB_DESCRIPTION.toLocaleString('en-US')} characters.`
    );
  }
  return text;
}

function cleanCompany(body = {}) {
  const name = String(body.companyName ?? '').trim().slice(0, 120);
  let website = String(body.companyWebsite ?? '').trim().slice(0, 300);

  if (website) {
    if (!/^https?:\/\//i.test(website)) website = `https://${website}`;
    try {
      new URL(website);
    } catch {
      throw new ApiError(400, 'The company website does not look like a URL.');
    }
  }

  return { name, website };
}

function cleanFileName(value) {
  return String(value ?? '')
    .replace(/[\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 255);
}

/** Full record for the report page; the stored resume text is never returned. */
export function serializeAnalysis(doc) {
  const data = doc.toJSON ? doc.toJSON() : { ...doc, id: String(doc._id) };
  delete data.resumeText;
  return data;
}

function serializeSummary(doc) {
  return {
    id: String(doc._id),
    status: doc.status,
    stage: doc.stage || '',
    error: doc.error || '',
    createdAt: doc.createdAt,
    completedAt: doc.completedAt ?? null,
    company: doc.companyDetails ?? {},
    document: doc.document ?? {},
    summary: doc.analysis?.summary || '',
  };
}

/** Read the resume from an uploaded file, or from the text pasted in the form. */
async function readResume(file, pastedText) {
  if (file?.buffer?.length) {
    const { format } = await validateResumeFile(file);
    const extracted = await extractResumeText({ buffer: file.buffer, format });

    return {
      text: extracted.text,
      document: {
        fileName: cleanFileName(file.originalname),
        format,
        pages: extracted.pages,
        words: extracted.words,
      },
    };
  }

  const extracted = extractPastedResumeText(pastedText);

  return {
    text: extracted.text,
    document: {
      fileName: 'Pasted resume',
      format: 'text',
      pages: 0,
      words: extracted.words,
    },
  };
}

/** The job description can arrive as text or as a PDF/DOCX file. */
async function readJobDescription(file, pastedText) {
  if (file?.buffer?.length) {
    const { format } = await validateResumeFile(file);
    const extracted = await extractJobDescriptionText({ buffer: file.buffer, format });
    return cleanJobDescription(extracted.text);
  }

  return cleanJobDescription(pastedText);
}

/** Read both sides, persist the text, then queue the AI review. */
export async function createResumeAnalysis({ user, file, jobDescriptionFile, body = {} }) {
  if (!file?.buffer?.length && !String(body.resumeText ?? '').trim()) {
    throw new ApiError(400, 'Attach your resume as a PDF or DOCX file, or paste its text.');
  }
  if (!jobDescriptionFile?.buffer?.length && !String(body.jobDescription ?? '').trim()) {
    throw new ApiError(
      400,
      'Upload the job description as a PDF or DOCX file, or paste its text.'
    );
  }

  const companyDetails = cleanCompany(body);
  const customInstructions = String(body.customInstructions ?? '').trim().slice(0, MAX_INSTRUCTIONS);

  const resume = await readResume(file, body.resumeText);
  const jobDescription = await readJobDescription(jobDescriptionFile, body.jobDescription);

  const analysis = await ResumeAnalysis.create({
    user: user._id,
    resumeText: resume.text,
    jobDescription,
    companyDetails,
    customInstructions,
    document: resume.document,
    status: 'QUEUED',
  });

  try {
    await enqueueResumeJob({ kind: 'analysis', id: String(analysis._id) });
  } catch (error) {
    await ResumeAnalysis.updateOne(
      { _id: analysis._id },
      { $set: { status: 'FAILED', error: 'Could not start the analysis. Please try again.' } }
    ).catch(() => {});
    throw error;
  }

  return serializeAnalysis(analysis);
}

export async function listResumeAnalyses(user) {
  const analyses = await ResumeAnalysis.find({ user: user._id })
    .select(LIST_FIELDS)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return analyses.map(serializeSummary);
}

export async function getResumeAnalysis(user, id) {
  const analysis = await ResumeAnalysis.findOne({
    _id: toObjectId(id),
    user: user._id,
  }).select('-resumeText');

  if (!analysis) throw new ApiError(404, 'Analysis not found');
  return serializeAnalysis(analysis);
}

export async function deleteResumeAnalysis(user, id) {
  const analysis = await ResumeAnalysis.findOneAndDelete({
    _id: toObjectId(id),
    user: user._id,
  }).select('_id');

  if (!analysis) throw new ApiError(404, 'Analysis not found');

  return { id: String(analysis._id) };
}

/** Put a failed analysis back in the queue. Completed work is not redone. */
export async function retryResumeAnalysis(user, id) {
  const analysis = await ResumeAnalysis.findOne({
    _id: toObjectId(id),
    user: user._id,
  }).select('status error');

  if (!analysis) throw new ApiError(404, 'Analysis not found');
  if (analysis.status === 'COMPLETED') {
    throw new ApiError(409, 'This analysis is already finished.');
  }
  if (analysis.status === 'PROCESSING' || analysis.status === 'QUEUED') {
    throw new ApiError(409, 'This analysis is already being processed.');
  }

  await ResumeAnalysis.updateOne(
    { _id: analysis._id, status: 'FAILED' },
    { $set: { status: 'QUEUED', stage: '', error: '' } }
  );

  try {
    await enqueueResumeJob({ kind: 'analysis', id: String(analysis._id) });
  } catch (error) {
    await ResumeAnalysis.updateOne(
      { _id: analysis._id },
      { $set: { status: 'FAILED', error: 'Could not restart the analysis. Please try again.' } }
    ).catch(() => {});
    throw error;
  }

  return serializeAnalysis(await ResumeAnalysis.findById(analysis._id).select('-resumeText'));
}
