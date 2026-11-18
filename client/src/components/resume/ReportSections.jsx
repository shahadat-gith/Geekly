
import { useState } from 'react';
import { ResumeSection } from './ResumeSection.jsx';

const REPORT_SECTIONS = [
  ['strengths', 'Strengths'],
  ['gaps', 'Gaps and missing skills'],
  ['requirements', 'Job requirement match'],
  ['skills', 'Technical skills'],
  ['projects', 'Projects'],
  ['ats', 'ATS readability'],
  ['improvements', 'Improvement plan'],
  ['assessment', 'Final assessment'],
  ['job-description', 'Job description'],
];

const PRIORITY_TONE = {
  Critical: 'bg-error/10 text-[#B94F47]',
  High: 'bg-accent-soft text-[#A9672D]',
  Medium: 'bg-warning/10 text-[#98651F]',
  Low: 'bg-surface-tertiary text-text-secondary',
};

const MATCH_TONE = {
  Strong: 'bg-success/10 text-[#527C42]',
  Partial: 'bg-warning/10 text-[#98651F]',
  'Not Demonstrated': 'bg-error/10 text-[#B94F47]',
};

const SKILL_TONE = {
  Strong: 'bg-success/10 text-[#527C42]',
  Good: 'bg-brand-soft text-[#527C42]',
  Partial: 'bg-warning/10 text-[#98651F]',
  Missing: 'bg-error/10 text-[#B94F47]',
};

function Tag({ tone, children }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold leading-none ${tone}`}
    >
      {children}
    </span>
  );
}

function Findings({ items, withSuggestion = false }) {
  if (!items?.length) {
    return (
      <p className="m-0 text-[13.5px] text-text-tertiary">
        Nothing to show here.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className={index ? 'border-t border-border-secondary pt-4' : ''}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="m-0 text-[14.5px] font-semibold leading-snug text-text">
              {item.title}
            </h3>
            {item.priority && (
              <Tag tone={PRIORITY_TONE[item.priority] ?? PRIORITY_TONE.Medium}>
                {item.priority}
              </Tag>
            )}
          </div>

          {item.description && (
            <p className="mt-1.5 text-[13.5px] leading-[1.7] text-text-secondary">
              {item.description}
            </p>
          )}

          {item.evidence && (
            <p className="mt-2 border-l-2 border-border pl-3 text-[13px] leading-[1.7] text-text-tertiary">
              {item.evidence}
            </p>
          )}

          {withSuggestion && item.suggestion && (
            <p className="mt-2 text-[13.5px] leading-[1.7] text-text-secondary">
              <span className="font-semibold text-text">Do this: </span>
              {item.suggestion}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function SkillRows({ items }) {
  return (
    <div className="flex flex-col divide-y divide-border-secondary">
      {items.map((skill, index) => (
        <div
          key={`${skill.name}-${index}`}
          className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
        >
          <div className="min-w-0">
            <p className="m-0 text-[14px] font-semibold leading-snug text-text">
              {skill.name}
            </p>

            {skill.evidence && (
              <p className="mt-1 text-[13px] leading-[1.65] text-text-tertiary">
                {skill.evidence}
              </p>
            )}

            {skill.reason && (
              <p className="mt-1 text-[13px] leading-[1.65] text-text-secondary">
                {skill.reason}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {skill.status && (
              <Tag tone={SKILL_TONE[skill.status] ?? SKILL_TONE.Missing}>
                {skill.status}
              </Tag>
            )}

            {skill.importance && (
              <span className="text-[11.5px] text-text-tertiary">
                {skill.importance} importance
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items, label }) {
  if (!items?.length) return null;

  return (
    <div>
      <h3 className="m-0 text-[13.5px] font-semibold text-text">
        {label}
      </h3>

      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[13.5px] leading-[1.7] text-text-secondary">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/** Resume report with persistent sidebar navigation and one visible section. */
export function ReportSections({ analysis, jobDescription, company }) {
  const [selected, setSelected] = useState('strengths');

  const ats = analysis.atsAnalysis ?? {};
  const verdict = analysis.finalVerdict ?? {};
  const missing = analysis.missingSkills ?? [];

  return (
    <div className="grid gap-5 lg:h-full lg:min-h-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      <nav
        aria-label="Resume report sections"
        className="rounded-card border border-border bg-surface p-3 shadow-card lg:self-start"
      >
        <p className="m-0 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Report sections
        </p>

        <ul className="m-0 flex list-none flex-row gap-1 overflow-x-auto p-0 lg:flex-col">
          {REPORT_SECTIONS.map(([key, label]) => (
            <li key={key} className="shrink-0 lg:shrink">
              <button
                type="button"
                aria-current={selected === key ? 'page' : undefined}
                onClick={() => setSelected(key)}
                className={`w-full rounded-button px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft ${selected === key
                    ? 'bg-brand-soft text-[#527C42]'
                    : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
                  }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2 lg:[scrollbar-gutter:stable]">
        <ResumeSection
          active={selected === 'strengths'}
          title="Strengths"
          meta={`${analysis.strengths?.length ?? 0} points`}
        >
          <Findings items={analysis.strengths} />
        </ResumeSection>

        <ResumeSection
          active={selected === 'gaps'}
          title="Gaps and missing skills"
          meta={`${analysis.shortcomings?.length ?? 0} gaps · ${missing.length} missing skills`}
          defaultOpen
        >
          <div className="flex flex-col gap-6">
            <Findings items={analysis.shortcomings} withSuggestion />

            <div>
              <h3 className="m-0 text-[13.5px] font-semibold text-text">
                Required but not demonstrated
              </h3>

              {missing.length ? (
                <div className="mt-3">
                  <SkillRows
                    items={missing.map((skill) => ({
                      ...skill,
                      status: 'Missing',
                    }))}
                  />
                </div>
              ) : (
                <p className="mt-2 text-[13.5px] leading-[1.7] text-text-secondary">
                  Every skill the posting requires is at least mentioned in the resume.
                </p>
              )}
            </div>
          </div>
        </ResumeSection>

        <ResumeSection
          active={selected === 'requirements'}
          title="Job requirement match"
          meta={`${analysis.requirementMatches?.length ?? 0} requirements`}
        >
          {analysis.requirementMatches?.length ? (
            <ul className="m-0 flex list-none flex-col divide-y divide-border-secondary p-0">
              {analysis.requirementMatches.map((item, index) => (
                <li
                  key={`${item.requirement}-${index}`}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="m-0 text-[14px] font-semibold leading-snug text-text">
                      {item.requirement}
                    </p>

                    <Tag
                      tone={
                        MATCH_TONE[item.status] ??
                        MATCH_TONE['Not Demonstrated']
                      }
                    >
                      {item.status}
                    </Tag>
                  </div>

                  {item.evidence && (
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-text-tertiary">
                      {item.evidence}
                    </p>
                  )}

                  {item.gap && (
                    <p className="mt-1 text-[13px] leading-[1.7] text-text-secondary">
                      <span className="font-semibold text-text">Gap: </span>
                      {item.gap}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-[13.5px] text-text-tertiary">
              The job description did not list individual requirements.
            </p>
          )}
        </ResumeSection>

        <ResumeSection
          active={selected === 'skills'}
          title="Technical skills"
          meta={`${analysis.skillsAnalysis?.length ?? 0} skills`}
        >
          {analysis.skillsAnalysis?.length ? (
            <SkillRows items={analysis.skillsAnalysis} />
          ) : (
            <p className="m-0 text-[13.5px] text-text-tertiary">
              No skill breakdown was produced.
            </p>
          )}
        </ResumeSection>

        <ResumeSection
          active={selected === 'projects'}
          title="Projects"
          meta={`${analysis.projectAnalysis?.length ?? 0} reviewed`}
        >
          <Findings items={analysis.projectAnalysis} />
        </ResumeSection>

        <ResumeSection
          active={selected === 'ats'}
          title="ATS readability"
          meta={
            ats.score === null || ats.score === undefined
              ? 'No score'
              : `${ats.score}/100`
          }
        >
          <div className="flex flex-col gap-5">
            <p className="m-0 text-[13px] leading-[1.7] text-text-tertiary">
              This is a structural review of the document. It is not a test run in a real applicant
              tracking system, and no system was contacted.
            </p>

            <BulletList
              items={ats.issues}
              label="What a parser may struggle with"
            />

            <BulletList
              items={ats.suggestions}
              label="How to fix it"
            />
          </div>
        </ResumeSection>

        <ResumeSection
          active={selected === 'improvements'}
          title="Improvement plan"
          meta="Ordered by impact"
        >
          <Findings items={analysis.improvements} withSuggestion />
        </ResumeSection>

        <ResumeSection
          active={selected === 'assessment'}
          title="Final assessment"
        >
          <div className="flex flex-col gap-5">
            <BulletList
              items={verdict.competitiveAdvantages}
              label="What works in your favour"
            />

            <BulletList
              items={verdict.concerns}
              label="What a hiring team will question"
            />

            <BulletList
              items={verdict.priorityActions}
              label="Do these first"
            />

            <p className="m-0 border-t border-border-secondary pt-4 text-[13px] leading-[1.7] text-text-tertiary">
              These scores describe how well this resume supports this application. They are not a
              probability of being hired.
            </p>
          </div>
        </ResumeSection>

        <ResumeSection
          active={selected === 'job-description'}
          title="What this was compared with"
          meta="Job description"
        >
          <div className="flex flex-col gap-3">
            {company?.website && (
              <p className="m-0 text-[13px] text-text-secondary">
                Company website: {company.website}
              </p>
            )}

            <p className="m-0 whitespace-pre-line text-[13px] leading-[1.75] text-text-secondary">
              {jobDescription}
            </p>
          </div>
        </ResumeSection>
      </div>
    </div>
  );
}
