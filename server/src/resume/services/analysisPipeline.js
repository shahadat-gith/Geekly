import mongoose from 'mongoose';
import ResumeAnalysis from '../../models/ResumeAnalysis.js';
import { requireDefaultModel } from '../../admin/services/aiModelService.js';
import { ApiError } from '../../shared/apiError.js';
import { prepareTextForModel } from '../utils/documents/extractText.js';
import {
  SYSTEM_PROMPT,
  buildEvaluationPrompt,
  buildProfilePrompt,
  buildRequirementsPrompt,
} from '../utils/prompts.js';
import { normalizeAnalysis, normalizeProfile, normalizeRequirements } from '../utils/validate.js';
import { runStage } from './ai.js';

// Two reads (resume profile, job requirements) run in parallel, then one
// evaluation call writes the report. The job is claimed atomically, so a
// duplicate SQS delivery cannot run the same analysis twice.

const RESUME_BUDGET = 24_000;
const JD_BUDGET = 9_000;
// A worker that dies mid-run leaves the document in PROCESSING. The stage
// updates refresh updatedAt while work is happening, so a document untouched
// for this long is stale and can be claimed again.
const STALE_AFTER_MS = 10 * 60 * 1000;

function userMessage(error) {
  if (error instanceof ApiError) return error.message;
  return 'The analysis could not be completed. Please try again.';
}

async function setStage(analysisId, stage) {
  await ResumeAnalysis.updateOne({ _id: analysisId }, { $set: { stage } }).catch(() => {});
}

export async function processResumeAnalysis(analysisId) {
  const job = await ResumeAnalysis.findOneAndUpdate(
    {
      _id: analysisId,
      // sanitizeFilter (enabled in config/mongodb.js) also applies to update
      // filters, so operator objects are marked as trusted.
      $or: [
        { status: mongoose.trusted({ $in: ['QUEUED', 'FAILED'] }) },
        {
          status: 'PROCESSING',
          updatedAt: mongoose.trusted({ $lt: new Date(Date.now() - STALE_AFTER_MS) }),
        },
      ],
    },
    { $set: { status: 'PROCESSING', stage: 'Reading the resume', error: '' } },
    { returnDocument: 'after' }
  );

  // Already completed or being processed by another worker.
  if (!job) return { skipped: true };

  try {
    const model = await requireDefaultModel('text');
    const resumeText = prepareTextForModel(job.resumeText, RESUME_BUDGET).text;
    const jobDescription = prepareTextForModel(job.jobDescription, JD_BUDGET).text;
    const company = job.companyDetails ?? {};
    const customInstructions = job.customInstructions ?? '';

    const [profile, requirements] = await Promise.all([
      runStage({
        model,
        feature: 'resume-analysis',
        stage: 'resume profile',
        system: SYSTEM_PROMPT,
        prompt: buildProfilePrompt({ resumeText }),
        normalize: normalizeProfile,
        temperature: 0.1,
      }),
      runStage({
        model,
        feature: 'resume-analysis',
        stage: 'job requirements',
        system: SYSTEM_PROMPT,
        prompt: buildRequirementsPrompt({ jobDescription, company, customInstructions }),
        normalize: normalizeRequirements,
        temperature: 0.1,
      }),
    ]);

    await setStage(analysisId, 'Matching your experience to the role');

    const analysis = await runStage({
      model,
      feature: 'resume-analysis',
      stage: 'evaluation report',
      system: SYSTEM_PROMPT,
      prompt: buildEvaluationPrompt({
        resumeText,
        jobDescription,
        company,
        customInstructions,
        profile,
        requirements,
      }),
      normalize: normalizeAnalysis,
      temperature: 0.25,
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
    const message = userMessage(error);

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
