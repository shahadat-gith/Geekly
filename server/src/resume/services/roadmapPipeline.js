import mongoose from 'mongoose';
import PreparationRoadmap from '../../models/PreparationRoadmap.js';
import ResumeAnalysis from '../../models/ResumeAnalysis.js';
import { requireDefaultModel } from '../../admin/services/aiModelService.js';
import { ApiError } from '../../shared/apiError.js';
import { prepareTextForModel } from '../utils/documents/extractText.js';
import { SYSTEM_PROMPT, buildRoadmapPrompt } from '../utils/prompts.js';
import { normalizeRoadmap } from '../utils/validate.js';
import { runStage } from './ai.js';

// The roadmap is generated from the finished report, not from the documents
// again, so it stays consistent with what the candidate was already told.

const JD_BUDGET = 6_000;
// Recover a plan left in PROCESSING by a worker that died mid-run.
const STALE_AFTER_MS = 10 * 60 * 1000;

function userMessage(error) {
  if (error instanceof ApiError) return error.message;
  return 'The preparation plan could not be generated. Please try again.';
}

async function fail(roadmapId, message) {
  await PreparationRoadmap.updateOne(
    { _id: roadmapId },
    { $set: { status: 'FAILED', error: message } }
  ).catch((error) => console.error('Could not mark the roadmap as failed:', error.message));
}

export async function processPreparationRoadmap(roadmapId) {
  const roadmap = await PreparationRoadmap.findOneAndUpdate(
    {
      _id: roadmapId,
      $or: [
        { status: mongoose.trusted({ $in: ['QUEUED', 'FAILED'] }) },
        {
          status: 'PROCESSING',
          updatedAt: mongoose.trusted({ $lt: new Date(Date.now() - STALE_AFTER_MS) }),
        },
      ],
    },
    { $set: { status: 'PROCESSING', error: '' } },
    { returnDocument: 'after' }
  );

  if (!roadmap) return { skipped: true };

  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: roadmap.analysis,
      user: roadmap.user,
    });

    if (!analysis || analysis.status !== 'COMPLETED' || !analysis.analysis) {
      await fail(roadmapId, 'Finish the resume analysis before building the preparation plan.');
      return { failed: true };
    }

    const model = await requireDefaultModel('text');
    const jobDescription = prepareTextForModel(analysis.jobDescription, JD_BUDGET).text;

    const plan = await runStage({
      model,
      feature: 'preparation-roadmap',
      stage: 'preparation plan',
      system: SYSTEM_PROMPT,
      prompt: buildRoadmapPrompt({
        analysis: analysis.analysis,
        jobDescription,
        company: analysis.companyDetails ?? {},
      }),
      normalize: normalizeRoadmap,
      temperature: 0.35,
    });

    await PreparationRoadmap.updateOne(
      { _id: roadmapId },
      {
        $set: {
          status: 'COMPLETED',
          overview: plan.overview,
          focusAreas: plan.focusAreas,
          totalMinutes: plan.totalMinutes,
          phases: plan.phases,
          topics: plan.topics,
          error: '',
          completedAt: new Date(),
        },
      }
    );

    return { completed: true };
  } catch (error) {
    const message = userMessage(error);
    await fail(roadmapId, message);
    console.error(`Preparation roadmap ${roadmapId} failed:`, error.message);
    return { failed: true, error: message };
  }
}
