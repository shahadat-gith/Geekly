import { processResumeAnalysis } from '../../features/resume/pipelines/analysis.js';

// A queued job is one id plus what kind of work it is. The pipeline claims the
// document itself, so redelivery is harmless.
export async function processJob(payload) {
  const id = String(payload?.id ?? '').trim();
  if (!id) {
    console.error('Resume job without an id was ignored.');
    return { skipped: true };
  }

  if (payload.kind === 'analysis') return processResumeAnalysis(id);

  console.error('Unknown resume job kind:', payload.kind);
  return { skipped: true };
}
