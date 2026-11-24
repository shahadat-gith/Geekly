import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaCopy } from 'react-icons/fa6';

import { Badge } from '../ui/Badge.jsx';

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'strengths', label: 'Strong points' },
  { key: 'gaps', label: 'Weak points' },
  { key: 'missing', label: 'Missing skills' },
  { key: 'fixes', label: 'Fixes' },
];

const SEVERITY_TONE = {
  Critical: 'error',
  High: 'warning',
  Medium: 'warning',
  Low: 'neutral',
};

const PRIORITY_LABEL = {
  Must: 'Must have',
  Nice: 'Nice to have',
};

function PanelHeading({ title, meta }) {
  return (
    <div className="mb-6 border-b border-border-secondary pb-4">
      <h2 className="m-0 font-heading text-[18px] font-medium leading-snug tracking-[-0.015em] text-text">
        {title}
      </h2>

      {meta && (
        <p className="m-0 mt-1 text-[12.5px] leading-snug text-text-tertiary">
          {meta}
        </p>
      )}
    </div>
  );
}

function EmptyNote({ children }) {
  return (
    <p className="m-0 border-l-2 border-border py-1 pl-4 text-[13px] leading-[1.75] text-text-secondary">
      {children}
    </p>
  );
}

function NumberedPoints({ items }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-4 p-0">
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className={index ? 'border-t border-border-secondary pt-4' : ''}
        >
          <div className="flex gap-4">
            <span className="mt-0.5 w-5 shrink-0 font-mono text-[10px] tabular-nums text-text-tertiary">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="min-w-0">
              <p className="m-0 text-[14px] font-medium leading-snug text-text">
                {item.title}
              </p>

              {item.detail && (
                <p className="m-0 mt-1 text-[13.5px] leading-[1.75] text-text-secondary">
                  {item.detail}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Older or non-secure contexts do not expose the async clipboard API.
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
}

function useCopyFeedback() {
  const [copied, setCopied] = useState('');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(key, text) {
    try {
      await writeClipboard(text);
      setCopied(key);
    } catch {
      setCopied('failed');
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(''), 1800);
  }

  return { copied, copy };
}

function CopyButton({ label, copiedLabel, copied, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-button px-2 text-[11.5px] font-medium text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? (
        <FaCheck aria-hidden="true" className="text-[11px]" />
      ) : (
        <FaCopy aria-hidden="true" className="text-[11px]" />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
}

function fixesAsText(edits) {
  return edits
    .map((edit, index) => {
      const lines = [`${index + 1}. ${edit.section} — ${edit.target}`];

      if (edit.before) lines.push(`Now: ${edit.before}`);
      lines.push(`Use: ${edit.after}`);
      if (edit.reason) lines.push(`Why: ${edit.reason}`);

      return lines.join('\n');
    })
    .join('\n\n');
}

function Fixes({ edits }) {
  const { copied, copy } = useCopyFeedback();

  if (!edits.length) {
    return (
      <EmptyNote>
        No changes are needed for this role. The resume already covers what this
        job asks for.
      </EmptyNote>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <p className="m-0 text-[12.5px] leading-[1.6] text-text-secondary">
          Each fix is finished text. Copy it into the section named above it.
        </p>

        <CopyButton
          label="Copy all fixes"
          copiedLabel="Copied all fixes"
          copied={copied === 'all'}
          onClick={() => copy('all', fixesAsText(edits))}
        />
      </div>

      <ol className="m-0 flex list-none flex-col gap-5 p-0">
        {edits.map((edit, index) => (
          <li
            key={`${edit.target}-${index}`}
            className={index ? 'border-t border-border-secondary pt-5' : ''}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="folio m-0">
                  {edit.section}
                </p>

                <p className="m-0 mt-1 text-[14px] font-medium leading-snug text-text">
                  {edit.target}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{edit.action}</Badge>
                <span aria-hidden="true" className="text-[11px] text-text-disabled">
                  ·
                </span>
                <Badge tone={SEVERITY_TONE[edit.priority] ?? 'warning'}>
                  {edit.priority}
                </Badge>
              </div>
            </div>

            {edit.before && (
              <p className="m-0 mt-2 border-l-2 border-border pl-3 text-[13px] leading-[1.7] text-text-tertiary">
                <span className="font-medium text-text-secondary">Now: </span>
                {edit.before}
              </p>
            )}

            <div className="mt-2 overflow-hidden rounded-field border border-border">
              <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-secondary/50 px-3 py-1.5">
                <span className="text-[11px] font-medium text-text-tertiary">
                  Paste this
                </span>

                <CopyButton
                  label="Copy"
                  copiedLabel="Copied"
                  copied={copied === `edit-${index}`}
                  onClick={() => copy(`edit-${index}`, edit.after)}
                />
              </div>

              <p className="m-0 whitespace-pre-line px-3 py-3 font-mono text-[12.5px] leading-[1.75] text-text">
                {edit.after}
              </p>
            </div>

            {edit.reason && (
              <p className="m-0 mt-2 text-[13px] leading-[1.7] text-text-secondary">
                <span className="font-medium text-text">Why: </span>
                {edit.reason}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Full review: summary, strong points, weak points, missing skills and fixes. */
export function ReportSections({ analysis }) {
  const [active, setActive] = useState('summary');
  const tabRefs = useRef({});

  const strengths = analysis.strengths ?? [];
  const gaps = analysis.gaps ?? [];
  const missingSkills = analysis.missingSkills ?? [];
  const edits = analysis.edits ?? [];

  const counts = {
    strengths: strengths.length,
    gaps: gaps.length,
    missing: missingSkills.length,
    fixes: edits.length,
  };

  function onTabKeyDown(event) {
    const index = TABS.findIndex((tab) => tab.key === active);
    if (index === -1) return;

    let next;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      next = (index + 1) % TABS.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      next = (index - 1 + TABS.length) % TABS.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = TABS.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActive(TABS[next].key);
    tabRefs.current[TABS[next].key]?.focus();
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface lg:grid lg:grid-cols-[216px_minmax(0,1fr)]">
      {/* Section navigation */}
      <div className="border-b border-border-secondary bg-surface-secondary/40 p-2 lg:border-b-0 lg:border-r lg:p-3">
        <div
          role="tablist"
          aria-label="Resume report sections"
          aria-orientation="vertical"
          onKeyDown={onTabKeyDown}
          className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {TABS.map((tab) => {
            const count = counts[tab.key];
            const selected = active === tab.key;

            return (
              <button
                key={tab.key}
                ref={(node) => {
                  tabRefs.current[tab.key] = node;
                }}
                type="button"
                role="tab"
                id={`report-tab-${tab.key}`}
                aria-selected={selected}
                aria-controls={`report-panel-${tab.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.key)}
                className={`inline-flex min-h-9 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full lg:border-b-0 lg:border-l-2 lg:py-2.5 ${
                  selected
                    ? 'border-brand bg-brand-soft/40 text-text'
                    : 'text-text-secondary hover:bg-surface hover:text-text'
                }`}
              >
                <span className="whitespace-nowrap">{tab.label}</span>

                {count > 0 && (
                  <span
                    className={`ml-auto hidden font-mono text-[10.5px] tabular-nums leading-none lg:inline ${selected ? 'text-brand-strong' : 'text-text-tertiary'}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        id={`report-panel-${active}`}
        aria-labelledby={`report-tab-${active}`}
        tabIndex={0}
        className="min-w-0 px-5 py-6 focus-visible:outline-none sm:px-8 sm:py-8"
      >
        {active === 'summary' && (
          <>
            <PanelHeading title="Summary" meta="Verdict for this role" />

            {analysis.summary ? (
              <p className="m-0 whitespace-pre-line text-[14px] leading-[1.8] text-text-secondary">
                {analysis.summary}
              </p>
            ) : (
              <EmptyNote>No summary was produced for this report.</EmptyNote>
            )}
          </>
        )}

        {active === 'strengths' && (
          <>
            <PanelHeading
              title="Strong points"
              meta={
                strengths.length
                  ? `${strengths.length} things working in your favour`
                  : 'What the resume does well'
              }
            />

            {strengths.length ? (
              <NumberedPoints items={strengths} />
            ) : (
              <EmptyNote>
                No specific strong points were found for this role. The fixes are
                where the gains are.
              </EmptyNote>
            )}
          </>
        )}

        {active === 'gaps' && (
          <>
            <PanelHeading
              title="Weak points"
              meta={
                gaps.length
                  ? `${gaps.length} issues holding this resume back`
                  : 'Nothing major found'
              }
            />

            {gaps.length ? (
              <ul className="m-0 flex list-none flex-col divide-y divide-border-secondary p-0">
                {gaps.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="m-0 text-[14px] font-medium leading-snug text-text">
                        {item.title}
                      </p>

                      <Badge tone={SEVERITY_TONE[item.severity] ?? 'warning'}>
                        {item.severity}
                      </Badge>
                    </div>

                    {item.detail && (
                      <p className="m-0 mt-1.5 text-[13.5px] leading-[1.75] text-text-secondary">
                        {item.detail}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyNote>No major weaknesses were found for this job.</EmptyNote>
            )}
          </>
        )}

        {active === 'missing' && (
          <>
            <PanelHeading
              title="Missing skills"
              meta={
                missingSkills.length
                  ? `${missingSkills.length} skills this job asks for that the resume does not show`
                  : 'Nothing missing'
              }
            />

            {missingSkills.length ? (
              <ul className="m-0 flex list-none flex-col divide-y divide-border-secondary p-0">
                {missingSkills.map((item, index) => (
                  <li key={`${item.skill}-${index}`} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="m-0 text-[14px] font-medium leading-snug text-text">
                        {item.skill}
                      </p>

                      <Badge tone="neutral">
                        {PRIORITY_LABEL[item.priority] ?? PRIORITY_LABEL.Must}
                      </Badge>
                    </div>

                    {item.detail && (
                      <p className="m-0 mt-1.5 text-[13.5px] leading-[1.75] text-text-secondary">
                        {item.detail}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyNote>
                Your resume shows every skill this job description asks for.
              </EmptyNote>
            )}
          </>
        )}

        {active === 'fixes' && (
          <>
            <PanelHeading
              title="Fixes to apply"
              meta={
                edits.length
                  ? `${edits.length} changes, ordered by impact`
                  : 'Nothing to change'
              }
            />

            <Fixes edits={edits} />
          </>
        )}
      </div>
    </div>
  );
}
