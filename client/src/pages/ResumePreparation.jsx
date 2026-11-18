
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useResume,
  useRoadmap,
  useStartRoadmap,
  useToggleTopic,
} from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ProcessingPanel } from '../components/resume/ProcessingPanel.jsx';
import { RoadmapTopic } from '../components/resume/RoadmapTopic.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { statusIsWorking } from '../components/resume/status.js';
import { formatDate, formatMinutes } from '../utils/format.js';

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-12">
      <div className="h-8 w-72 rounded bg-surface-tertiary" />
      <div className="mt-3 h-4 w-56 rounded bg-surface-tertiary" />
      <div className="mt-8 h-28 rounded-card bg-surface-tertiary" />
      <div className="mt-4 h-20 rounded-card bg-surface-tertiary" />
      <div className="mt-4 h-64 rounded-card bg-surface-tertiary" />
    </div>
  );
}

/** Group topics under their phase, keeping any topic whose phase is missing. */
function groupTopics(roadmap) {
  const topics = roadmap.topics ?? [];
  const phases = [...(roadmap.phases ?? [])].sort(
    (a, b) => a.number - b.number
  );

  const groups = phases
    .map((phase) => ({
      ...phase,
      topics: topics.filter((topic) => topic.phase === phase.number),
    }))
    .filter((group) => group.topics.length);

  const known = new Set(phases.map((phase) => phase.number));
  const rest = topics.filter((topic) => !known.has(topic.phase));

  if (rest.length) {
    groups.push({
      number: 0,
      title: 'More to prepare',
      description: '',
      topics: rest,
    });
  }

  return groups;
}

export default function ResumePreparation() {
  const { id } = useParams();

  const {
    data: analysis,
    isPending: analysisPending,
    error: analysisError,
  } = useResume(id);

  const { data: roadmap, isPending, error } = useRoadmap(id);

  const start = useStartRoadmap(id);
  const toggle = useToggleTopic(id);

  const [selected, setSelected] = useState(null);

  if (isPending || analysisPending) return <Skeleton />;

  if (analysisError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Alert tone={analysisError.status === 404 ? 'warning' : 'error'}>
          {analysisError.message}
        </Alert>

        <div className="mt-4">
          <Button as={Link} to="/resume-intelligence" variant="secondary">
            All analyses
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Alert tone={error.status === 404 ? 'warning' : 'error'}>
          {error.message}
        </Alert>

        <div className="mt-4">
          <Button as={Link} to="/resume-intelligence" variant="secondary">
            All analyses
          </Button>
        </div>
      </div>
    );
  }

  const notReady = analysis && analysis.status !== 'COMPLETED';
  const completed = roadmap?.status === 'COMPLETED';

  const groups = completed
    ? groupTopics(roadmap).map((group, index) => ({
      ...group,
      key: `phase-${group.number}-${index}`,
    }))
    : [];

  const activeKey =
    selected ?? (roadmap?.overview ? 'overview' : groups[0]?.key);

  const activePhase = groups.find((group) => group.key === activeKey);

  const subtitle = [analysis?.company?.name, formatDate(analysis?.createdAt)]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="m-0 font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-text sm:text-[34px]">
            Interview preparation plan
          </h1>

          <p className="m-0 mt-2 text-[13px] text-text-tertiary">
            {subtitle && <span>{subtitle} · </span>}

            <Link
              to={`/resume-intelligence/${id}`}
              className="font-medium text-[#527C42] transition-colors hover:text-[#3F6532]"
            >
              Full report
            </Link>
          </p>
        </div>

        {roadmap && <StatusChip status={roadmap.status} />}
      </div>

      {/* Analysis not ready */}
      {notReady && (
        <div className="mt-8">
          <Alert tone="info" title="The analysis is not finished">
            The preparation plan is built from the report, so it becomes
            available once the analysis is complete. Open the report to see its
            progress.
          </Alert>
        </div>
      )}

      {/* Start plan */}
      {!notReady && !roadmap && (
        <Card className="mt-8 p-6 sm:p-8">
          <h2 className="m-0 text-[16px] font-semibold text-text">
            Build your preparation plan
          </h2>

          <p className="mt-2 max-w-xl text-[13.5px] leading-[1.75] text-text-secondary">
            The plan starts from what this report found: the requirements you
            did not demonstrate, the gaps worth closing first, and the
            questions this role will ask. It is organised in five phases with
            concrete practice for each topic.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <div>
              <Button
                onClick={() => start.mutate()}
                disabled={start.isPending}
              >
                {start.isPending ? 'Building…' : 'Build my plan'}
              </Button>
            </div>

            {start.error && <Alert>{start.error.message}</Alert>}
          </div>
        </Card>
      )}

      {/* Generating */}
      {roadmap && statusIsWorking(roadmap.status) && (
        <div className="mt-8">
          <ProcessingPanel
            title="Building your preparation plan"
            stage="Turning the report into a study plan…"
            note="This usually takes about a minute. The page updates on its own, and you can leave it — the plan keeps generating."
          />
        </div>
      )}

      {/* Generation failed */}
      {roadmap?.status === 'FAILED' && (
        <div className="mt-8 flex flex-col gap-4">
          <Alert tone="error" title="The plan could not be generated">
            {roadmap.error || 'Something went wrong while writing the plan.'}
          </Alert>

          <div>
            <Button
              onClick={() => start.mutate()}
              disabled={start.isPending}
            >
              {start.isPending ? 'Retrying…' : 'Try again'}
            </Button>
          </div>

          {start.error && <Alert>{start.error.message}</Alert>}
        </div>
      )}

      {/* Completed preparation plan */}
      {completed && (
        <div className="mt-8 grid gap-6 lg:h-[calc(100svh-262px)] lg:min-h-[520px] lg:grid-cols-[248px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          {/* Sidebar */}
          <nav
            aria-label="Preparation plan sections"
            className="flex flex-col gap-4 rounded-card border border-border bg-surface p-3 shadow-card lg:self-start"
          >
            {/* Progress summary */}
            <div className="rounded-button border border-border-secondary bg-surface-secondary px-3 py-3">
              <p className="m-0 text-[12.5px] font-semibold text-text">
                {roadmap.progress.completed} of {roadmap.progress.total} topics
                done
              </p>

              <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
                {[
                  formatMinutes(roadmap.totalMinutes),
                  `${roadmap.progress.percent}% complete`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>

              <div
                role="progressbar"
                aria-label="Preparation progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={roadmap.progress.percent}
                className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-tertiary"
              >
                <div
                  className="h-full rounded-full bg-[#73A85E] transition-all duration-300"
                  style={{ width: `${roadmap.progress.percent}%` }}
                />
              </div>
            </div>

            {/* Phase navigation */}
            <ul className="m-0 flex list-none flex-row gap-1 overflow-x-auto p-0 lg:flex-col">
              {roadmap.overview && (
                <li className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    aria-current={
                      activeKey === 'overview' ? 'page' : undefined
                    }
                    onClick={() => setSelected('overview')}
                    className={`w-full whitespace-nowrap rounded-button px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft lg:whitespace-normal ${activeKey === 'overview'
                        ? 'bg-brand-soft text-[#527C42]'
                        : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
                      }`}
                  >
                    Overview
                  </button>
                </li>
              )}

              {groups.map((group) => (
                <li key={group.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    aria-current={
                      activeKey === group.key ? 'page' : undefined
                    }
                    onClick={() => setSelected(group.key)}
                    className={`w-full rounded-button px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft ${activeKey === group.key
                        ? 'bg-brand-soft text-[#527C42]'
                        : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
                      }`}
                  >
                    <span className="flex items-baseline justify-between gap-2 text-[13px] font-medium">
                      <span className="truncate whitespace-nowrap lg:whitespace-normal">
                        {group.number
                          ? `Phase ${group.number}`
                          : group.title}
                      </span>

                      <span className="shrink-0 text-[11px] font-normal text-text-tertiary">
                        {
                          group.topics.filter((topic) => topic.completed)
                            .length
                        }
                        /{group.topics.length}
                      </span>
                    </span>

                    {group.number && (
                      <span className="mt-0.5 hidden truncate text-[12px] text-text-tertiary lg:block">
                        {group.title}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main content */}
          <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2 lg:[scrollbar-gutter:stable]">
            {activeKey === 'overview' ? (
              <Card className="p-6">
                <h2 className="m-0 text-[15px] font-semibold text-text">
                  How to use this plan
                </h2>

                <p className="m-0 mt-3 whitespace-pre-line text-[14px] leading-[1.8] text-text-secondary">
                  {roadmap.overview}
                </p>

                {roadmap.focusAreas?.length ? (
                  <ul className="m-0 mt-4 flex list-none flex-wrap gap-1.5 p-0">
                    {roadmap.focusAreas.map((area, index) => (
                      <li
                        key={index}
                        className="rounded-full border border-border-secondary bg-surface-secondary px-2.5 py-1 text-[12px] leading-none text-text-secondary"
                      >
                        {area}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ) : (
              activePhase && (
                <section className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="m-0 text-[17px] font-semibold leading-snug text-text">
                      {activePhase.number
                        ? `Phase ${activePhase.number} · `
                        : ''}
                      {activePhase.title}
                    </h2>

                    <span className="text-[12.5px] text-text-tertiary">
                      {
                        activePhase.topics.filter(
                          (topic) => topic.completed
                        ).length
                      }
                      /{activePhase.topics.length} done
                    </span>
                  </div>

                  {activePhase.description && (
                    <p className="m-0 max-w-2xl text-[13.5px] leading-[1.75] text-text-secondary">
                      {activePhase.description}
                    </p>
                  )}

                  <div className="mt-1 flex flex-col gap-2">
                    {activePhase.topics.map((topic) => (
                      <RoadmapTopic
                        key={topic.id}
                        topic={topic}
                        busy={toggle.isPending}
                        onToggle={(topicId, next) =>
                          toggle.mutate({
                            topicId,
                            completed: next,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              )
            )}

            {toggle.error && (
              <div className="mt-4">
                <Alert>{toggle.error.message}</Alert>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
