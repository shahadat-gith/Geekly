import mongoose from 'mongoose';
import ResumeAnalysis from '../../models/ResumeAnalysis.js';
import PreparationRoadmap from '../../models/PreparationRoadmap.js';
import { ApiError } from '../../shared/apiError.js';
import { validateResumeFile } from '../utils/documents/validateFile.js';
import { extractResumeText } from '../utils/documents/extractText.js';
import { enqueueResumeJob } from '../../queues/publishers/resumePublisher.js';

// All reads and writes go through the signed-in user. A document that belongs
// to someone else is reported as missing, not forbidden, so ids cannot be
// probed.

const MAX_JOB_DESCRIPTION = 20_000;
const MAX_INSTRUCTIONS = 2_000;

const LIST_FIELDS =
  'status stage error createdAt completedAt companyDetails document ' +
  'analysis.overallScore analysis.jobMatchScore analysis.summary ' +
  'analysis.finalVerdict.summary';

function objectId(value, message = 'Analysis not found') {
  if (!mongoose.Types.ObjectId.isValid(String(value ?? ''))) {
    throw new ApiError(404, message);
  }
  return new mongoose.Types.ObjectId(String(value));
}

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

function scores(analysis) {
  if (!analysis) return null;
  return {
    overall: analysis.overallScore ?? null,
    jobMatch: analysis.jobMatchScore ?? null,
    technical: analysis.technicalScore ?? null,
    projects: analysis.projectScore ?? null,
    presentation: analysis.presentationScore ?? null,
    ats: analysis.atsAnalysis?.score ?? null,
  };
}

/** Full record for the report page; the stored resume text is never returned. */
export function serializeAnalysis(doc) {
  const data = doc.toJSON ? doc.toJSON() : { ...doc, id: String(doc._id) };
  delete data.resumeText;

  return {
    ...data,
    scores: scores(data.analysis),
  };
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
    scores: scores(doc.analysis),
    summary: doc.analysis?.summary || doc.analysis?.finalVerdict?.summary || '',
  };
}

/** Upload, extract, persist the text, then queue the AI pipeline. */
export async function createResumeAnalysis({ user, file, body = {} }) {
  if (!file?.buffer?.length) {
    throw new ApiError(400, 'Attach your resume as a PDF or DOCX file.');
  }

  // Validate every text field before doing the (slightly slower) extraction.
  const jobDescription = cleanJobDescription(body.jobDescription);
  const companyDetails = cleanCompany(body);
  const customInstructions = String(body.customInstructions ?? '').trim().slice(0, MAX_INSTRUCTIONS);

  const { format } = await validateResumeFile(file);
  const extracted = await extractResumeText({ buffer: file.buffer, format });

  const analysis = await ResumeAnalysis.create({
    user: user._id,
    resumeText: extracted.text,
    jobDescription,
    companyDetails,
    customInstructions,
    document: {
      fileName: cleanFileName(file.originalname),
      format,
      pages: extracted.pages,
      words: extracted.words,
    },
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
    _id: objectId(id),
    user: user._id,
  }).select('-resumeText');

  if (!analysis) throw new ApiError(404, 'Analysis not found');
  return serializeAnalysis(analysis);
}

export async function deleteResumeAnalysis(user, id) {
  const analysis = await ResumeAnalysis.findOneAndDelete({
    _id: objectId(id),
    user: user._id,
  }).select('_id');

  if (!analysis) throw new ApiError(404, 'Analysis not found');

  // The plan is only useful alongside its report.
  await PreparationRoadmap.deleteMany({ analysis: analysis._id, user: user._id });

  return { id: String(analysis._id) };
}

/** Put a failed analysis back in the queue. Completed work is not redone. */
export async function retryResumeAnalysis(user, id) {
  const analysis = await ResumeAnalysis.findOne({
    _id: objectId(id),
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

async function requireCompletedAnalysis(user, analysisId) {
  const analysis = await ResumeAnalysis.findOne({
    _id: objectId(analysisId),
    user: user._id,
  }).select('status analysis');

  if (!analysis) throw new ApiError(404, 'Analysis not found');
  if (analysis.status !== 'COMPLETED' || !analysis.analysis) {
    throw new ApiError(409, 'Finish the resume analysis before building a preparation plan.');
  }
  return analysis;
}

function serializeRoadmap(doc) {
  const data = doc.toJSON();

  // Topic subdocuments keep their _id for progress updates. Expose it as a
  // plain string id so the client has one identifier to use.
  const topics = (data.topics ?? []).map((topic) => {
    const { _id, ...rest } = topic;
    return { id: _id ? String(_id) : '', ...rest };
  });

  const total = topics.length;
  const completed = topics.filter((topic) => topic.completed).length;

  return {
    ...data,
    topics,
    progress: {
      total,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0,
    },
  };
}

/**
 * Idempotent: the plan is created once per analysis. Asking again returns the
 * existing plan and, when the previous attempt failed, queues it again.
 */
export async function startPreparationRoadmap(user, analysisId) {
  const analysis = await requireCompletedAnalysis(user, analysisId);

  let roadmap = await PreparationRoadmap.findOne({
    analysis: analysis._id,
    user: user._id,
  });

  if (!roadmap) {
    try {
      roadmap = await PreparationRoadmap.create({
        user: user._id,
        analysis: analysis._id,
      });
    } catch (error) {
      // Unique index: a concurrent request created it first.
      if (error?.code !== 11000) throw error;
      roadmap = await PreparationRoadmap.findOne({ analysis: analysis._id, user: user._id });
    }
  }

  if (!roadmap) {
    throw new ApiError(503, 'Could not create the preparation plan. Please try again.');
  }

  if (roadmap && roadmap.status === 'FAILED') {
    await PreparationRoadmap.updateOne(
      { _id: roadmap._id, status: 'FAILED' },
      { $set: { status: 'QUEUED', error: '' } }
    );
    roadmap.status = 'QUEUED';
    roadmap.error = '';
  }

  if (roadmap && roadmap.status === 'QUEUED') {
    try {
      await enqueueResumeJob({ kind: 'roadmap', id: String(roadmap._id) });
    } catch (error) {
      await PreparationRoadmap.updateOne(
        { _id: roadmap._id },
        { $set: { status: 'FAILED', error: 'Could not start the plan. Please try again.' } }
      ).catch(() => {});
      throw error;
    }
  }

  return serializeRoadmap(roadmap);
}

export async function getPreparationRoadmap(user, analysisId) {
  const roadmap = await PreparationRoadmap.findOne({
    analysis: objectId(analysisId),
    user: user._id,
  });

  if (!roadmap) throw new ApiError(404, 'No preparation plan has been built for this analysis.');
  return serializeRoadmap(roadmap);
}

export async function setTopicCompletion(user, analysisId, topicId, completed) {
  const roadmap = await PreparationRoadmap.findOne({
    analysis: objectId(analysisId),
    user: user._id,
  });

  if (!roadmap) throw new ApiError(404, 'No preparation plan has been built for this analysis.');

  const topic = roadmap.topics.id(topicId);
  if (!topic) throw new ApiError(404, 'Preparation topic not found');

  topic.completed = Boolean(completed);
  topic.completedAt = topic.completed ? new Date() : null;
  await roadmap.save();

  return serializeRoadmap(roadmap);
}
