import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaCopy } from 'react-icons/fa6';

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'strengths', label: 'Strong points' },
  { key: 'gaps', label: 'Weak points' },
  { key: 'missing', label: 'Missing skills' },
  { key: 'fixes', label: 'Fixes' },
];

const SEVERITY_TONE = {
  Critical: 'bg-error/10 text-[#B94F47]',
  High: 'bg-accent-soft text-[#A9672D]',
  Medium: 'bg-warning/10 text-[#98651F]',
  Low: 'bg-surface-tertiary text-text-secondary',
};

const PRIORITY_LABEL = {
  Must: 'Must have',
  Nice: 'Nice to have',
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

function PanelHeading({ title, meta }) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-secondary pb-4">
      <h2 className="m-0 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">
        {title}
      </h2>

      {meta && (
        <span className="text-[12.5px] leading-snug text-text-tertiary">{meta}</span>
      )}
    </div>
  );
}

function NumberedPoints({ items, tone }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-4 p-0">
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className={index ? 'border-t border-border-secondary pt-4' : ''}
        >
          <div className="flex gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${tone}`}
            >
              {index + 1}
            </span>

            <div className="min-w-0">
              <p className="m-0 text-[14px] font-semibold leading-snug text-text">
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
      className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-button px-2.5 text-[12px] font-semibold text-[#527C42] transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
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
      <p className="m-0 text-[13.5px] leading-[1.7] text-text-secondary">
        No changes are needed for this role. The resume already covers what this
        job asks for.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-[13px] leading-[1.7] text-text-secondary">
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
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  {edit.section}
                </p>

                <p className="m-0 mt-1 text-[14px] font-semibold leading-snug text-text">
                  {edit.target}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="bg-surface-tertiary text-text-secondary">
                  {edit.action}
                </Tag>

                <Tag tone={SEVERITY_TONE[edit.priority] ?? SEVERITY_TONE.Medium}>
                  {edit.priority}
                </Tag>
              </div>
            </div>

            {edit.before && (
              <p className="mt-2 border-l-2 border-border pl-3 text-[13px] leading-[1.7] text-text-tertiary">
                <span className="font-semibold text-text-secondary">Now: </span>
                {edit.before}
              </p>
            )}

            <div className="mt-2 overflow-hidden rounded-button border border-border bg-surface-secondary">
              <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-1.5">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
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
              <p className="mt-2 text-[13px] leading-[1.7] text-text-secondary">
                <span className="font-semibold text-text">Why: </span>
                {edit.reason}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Full review in tabs: summary, strong points, weak points, missing skills, fixes. */
export function ReportSections({ analysis }) {
  const [active, setActive] = useState('summary');

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

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div
        role="tablist"
        aria-label="Resume report sections"
        className="flex gap-1 overflow-x-auto border-b border-border-secondary p-2"
      >
        {TABS.map((tab) => {
          const count = counts[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`report-tab-${tab.key}`}
              aria-selected={active === tab.key}
              aria-controls={`report-panel-${tab.key}`}
              tabIndex={active === tab.key ? 0 : -1}
              onClick={() => setActive(tab.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-button px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft ${
                active === tab.key
                  ? 'bg-brand-soft text-[#527C42]'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
              }`}
            >
              {tab.label}

              {count > 0 && (
                <span className="rounded-full bg-surface-tertiary px-1.5 py-0.5 text-[10.5px] font-semibold leading-none text-text-secondary">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`report-panel-${active}`}
        aria-labelledby={`report-tab-${active}`}
        className="px-5 py-5 sm:px-6 sm:py-6"
      >
        {active === 'summary' && (
          <>
            <PanelHeading title="Summary" meta="Verdict for this role" />

            {analysis.summary ? (
              <p className="m-0 whitespace-pre-line text-[14px] leading-[1.8] text-text-secondary">
                {analysis.summary}
              </p>
            ) : (
              <p className="m-0 text-[13.5px] text-text-tertiary">
                No summary was produced for this report.
              </p>
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
              <NumberedPoints
                items={strengths}
                tone="bg-success/10 text-[#527C42]"
              />
            ) : (
              <p className="m-0 text-[13.5px] leading-[1.7] text-text-tertiary">
                No specific strong points were found for this role. The fixes are where the
                gains are.
              </p>
            )}
          </>
        )}

        {active === 'gaps' && (
          <>
            <PanelHeading
              title="Weak points"
              meta={gaps.length ? `${gaps.length} issues holding this resume back` : 'Nothing major found'}
            />

            {gaps.length ? (
              <ul className="m-0 flex list-none flex-col divide-y divide-border-secondary p-0">
                {gaps.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="m-0 text-[14px] font-semibold leading-snug text-text">
                        {item.title}
                      </p>

                      <Tag tone={SEVERITY_TONE[item.severity] ?? SEVERITY_TONE.Medium}>
                        {item.severity}
                      </Tag>
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
              <p className="m-0 text-[13.5px] leading-[1.7] text-text-tertiary">
                No major weaknesses were found for this job.
              </p>
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
                      <p className="m-0 text-[14px] font-semibold leading-snug text-text">
                        {item.skill}
                      </p>

                      <Tag tone="bg-surface-tertiary text-text-secondary">
                        {PRIORITY_LABEL[item.priority] ?? PRIORITY_LABEL.Must}
                      </Tag>
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
              <p className="m-0 text-[13.5px] leading-[1.7] text-text-tertiary">
                Your resume shows every skill this job description asks for.
              </p>
            )}
          </>
        )}

        {active === 'fixes' && (
          <>
            <PanelHeading
              title="Fixes to apply"
              meta={edits.length ? `${edits.length} changes, ordered by impact` : 'Nothing to change'}
            />

            <Fixes edits={edits} />
          </>
        )}
      </div>
    </div>
  );
}
