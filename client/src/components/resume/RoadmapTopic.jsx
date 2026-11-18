
import { useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa6';
import { formatMinutes } from '../../utils/format.js';

const PRIORITY_TONE = {
  'Must Prepare': 'bg-error/10 text-[#B94F47]',
  Important: 'bg-warning/10 text-[#98651F]',
  'Good to Know': 'bg-surface-tertiary text-text-secondary',
};

function DetailBlock({ title, children }) {
  return (
    <div>
      <h4 className="m-0 text-[12.5px] font-semibold text-text">
        {title}
      </h4>
      <div className="mt-1.5 text-[13.5px] leading-[1.7] text-text-secondary">
        {children}
      </div>
    </div>
  );
}

function Bullets({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function RoadmapTopic({ topic, busy, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-card border bg-surface transition-colors ${topic.completed ? 'border-border-secondary' : 'border-border'
        }`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <button
          type="button"
          onClick={() => onToggle(topic.id, !topic.completed)}
          disabled={busy}
          aria-pressed={topic.completed}
          aria-label={
            topic.completed
              ? `Mark ${topic.title} as not done`
              : `Mark ${topic.title} as done`
          }
          className={`mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:opacity-50 ${topic.completed
              ? 'border-success bg-success text-white'
              : 'border-border bg-surface hover:border-[#91C879] hover:bg-brand-soft'
            }`}
        >
          {topic.completed && (
            <FaCheck aria-hidden="true" className="text-[10px]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
        >
          <span
            className={`block text-[14.5px] font-semibold leading-snug ${topic.completed
                ? 'text-text-tertiary line-through'
                : 'text-text'
              }`}
          >
            {topic.title}
          </span>

          <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-text-tertiary">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${PRIORITY_TONE[topic.priority] ?? PRIORITY_TONE.Important
                }`}
            >
              {topic.priority}
            </span>

            {topic.category && <span>{topic.category}</span>}
            <span>{topic.difficulty}</span>

            {topic.estimatedMinutes ? (
              <span>{formatMinutes(topic.estimatedMinutes)}</span>
            ) : null}
          </span>
        </button>

        <FaChevronDown
          aria-hidden="true"
          className={`mt-1 shrink-0 text-[11px] text-text-tertiary transition-transform duration-200 ${open ? 'rotate-180' : ''
            }`}
        />
      </div>

      {open && (
        <div className="flex flex-col gap-5 border-t border-border-secondary px-4 py-4">
          {topic.whyItMatters && (
            <DetailBlock title="Why it matters">
              <p className="m-0">{topic.whyItMatters}</p>
            </DetailBlock>
          )}

          {(topic.resumeConnection || topic.jobConnection) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {topic.resumeConnection && (
                <DetailBlock title="From your resume">
                  <p className="m-0">{topic.resumeConnection}</p>
                </DetailBlock>
              )}

              {topic.jobConnection && (
                <DetailBlock title="From the job description">
                  <p className="m-0">{topic.jobConnection}</p>
                </DetailBlock>
              )}
            </div>
          )}

          {topic.whatToLearn?.length ? (
            <DetailBlock title="What to be able to do">
              <Bullets items={topic.whatToLearn} />
            </DetailBlock>
          ) : null}

          {topic.concepts?.length ? (
            <DetailBlock title="Concepts">
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {topic.concepts.map((concept, index) => (
                  <li
                    key={index}
                    className="rounded-full border border-border-secondary bg-surface-secondary px-2.5 py-1 text-[12px] leading-none text-text-secondary"
                  >
                    {concept}
                  </li>
                ))}
              </ul>
            </DetailBlock>
          ) : null}

          {topic.practical?.length ? (
            <DetailBlock title="Practice">
              <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5">
                {topic.practical.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </DetailBlock>
          ) : null}

          {topic.interviewQuestions?.length ? (
            <DetailBlock title="Questions to expect">
              <Bullets items={topic.interviewQuestions} />
            </DetailBlock>
          ) : null}

          {topic.expectedOutcome && (
            <DetailBlock title="When it is done">
              <p className="m-0">{topic.expectedOutcome}</p>
            </DetailBlock>
          )}
        </div>
      )}
    </div>
  );
}
