import mongoose from 'mongoose';
import ResumeAnalysis from '../../../models/ResumeAnalysis.js';
import { requireDefaultModel } from '../../../domain/ai/models.js';
import { prepareTextForModel } from '../documents/extract.js';
import { SYSTEM_PROMPT, buildReviewPrompt } from '../prompts.js';
import { normalizeAnalysis } from '../normalizers.js';
import { runStage } from './stage.js';
import { staleBefore, userMessage } from './common.js';

// One model call reviews the resume against the job description and writes the
// fixes. The job is claimed atomically, so a duplicate queue delivery cannot run
// the same analysis twice.

const RESUME_BUDGET = 18_000;
const JD_BUDGET = 8_000;

async function setStage(analysisId, stage) {
  await ResumeAnalysis.updateOne({ _id: analysisId }, { $set: { stage } }).catch(() => {});
}

export async function processResumeAnalysis(analysisId) {
  const job = await ResumeAnalysis.findOneAndUpdate(
    {
      _id: analysisId,
      // sanitizeFilter (enabled in config/database.js) also applies to update
      // filters, so operator objects are marked as trusted.
      $or: [
        { status: mongoose.trusted({ $in: ['QUEUED', 'FAILED'] }) },
        {
          status: 'PROCESSING',
          updatedAt: mongoose.trusted({ $lt: staleBefore() }),
        },
      ],
    },
    {
      $set: { status: 'PROCESSING', stage: 'Reading your resume and the job description', error: '' },
    },
    { returnDocument: 'after' }
  );

  // Already completed or being processed by another worker.
  if (!job) return { skipped: true };

  try {
    const model = await requireDefaultModel('text');
    const resumeText = prepareTextForModel(job.resumeText, RESUME_BUDGET).text;
    const jobDescription = prepareTextForModel(job.jobDescription, JD_BUDGET).text;

    await setStage(analysisId, 'Writing your review and fixes');

    const analysis = await runStage({
      model,
      feature: 'resume-analysis',
      stage: 'resume review',
      system: SYSTEM_PROMPT,
      prompt: buildReviewPrompt({
        resumeText,
        jobDescription,
        company: job.companyDetails ?? {},
        customInstructions: job.customInstructions ?? '',
      }),
      normalize: normalizeAnalysis,
      temperature: 0.2,
    });

    await ResumeAnalysis.updateOne(
      { _id: analysisId },
      {
        $set: {
          status: 'COMPLETED',
          stage: '',
          analysis,
          error: '',
          completedAt: new Date(),
        },
      }
    );

    return { completed: true };
  } catch (error) {
    const message = userMessage(error, 'The analysis could not be completed. Please try again.');

    await ResumeAnalysis.updateOne(
      { _id: analysisId },
      { $set: { status: 'FAILED', stage: '', error: message } }
    ).catch((updateError) => {
      console.error('Could not mark the resume analysis as failed:', updateError.message);
    });

    console.error(`Resume analysis ${analysisId} failed:`, error.message);
    return { failed: true, error: message };
  }
}
