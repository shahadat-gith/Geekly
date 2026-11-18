import { processResumeAnalysis } from '../../resume/services/analysisPipeline.js';
import { processPreparationRoadmap } from '../../resume/services/roadmapPipeline.js';

// A queued job is one id plus what kind of work it is. The pipelines claim the
// document themselves, so redelivery is harmless.
export async function processJob(payload) {
  const id = String(payload?.id ?? '').trim();
  if (!id) {
    console.error('Resume job without an id was ignored.');
    return { skipped: true };
  }

  if (payload.kind === 'analysis') return processResumeAnalysis(id);
  if (payload.kind === 'roadmap') return processPreparationRoadmap(id);

  console.error('Unknown resume job kind:', payload.kind);
  return { skipped: true };
}
