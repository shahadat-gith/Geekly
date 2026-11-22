import { Link } from 'react-router-dom';
import {
  FaFileLines,
  FaBullseye,
  FaListCheck,
  FaLock,
} from 'react-icons/fa6';

import { Button } from '../components/ui/Button.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { UploadForm } from '../components/resume/UploadForm.jsx';

const WHAT_YOU_GET = [
  {
    Icon: FaBullseye,
    title: 'Requirement match',
    description: 'Which requirements your resume evidences, and where the evidence is thin.',
  },
  {
    Icon: FaListCheck,
    title: 'Ordered fixes',
    description: 'Finished lines per section, ordered by the impact they have on this role.',
  },
  {
    Icon: FaFileLines,
    title: 'A saved report',
    description: 'Every run is kept in your profile so you can compare revisions over time.',
  },
];

export default function ResumeAnalysis() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <PageHeader
        eyebrow="Resume intelligence"
        title="Review a resume against a role"
        description="Give us the resume you are sending and the job description you are targeting. You get the requirement match and the exact text to paste into the resume."
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
        <div className="min-w-0 rounded-panel border border-border bg-surface p-5 shadow-card sm:p-7">
          <UploadForm />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="eyebrow m-0">What you get</h2>

            <ul className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
              {WHAT_YOU_GET.map(({ Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                    <Icon aria-hidden="true" className="text-[13px]" />
                  </span>

                  <div className="min-w-0">
                    <p className="m-0 text-[13px] font-semibold text-text">{title}</p>
                    <p className="m-0 mt-1 text-[12px] leading-[1.65] text-text-secondary">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-border bg-surface-secondary p-5">
            <div className="flex items-center gap-2 text-text-secondary">
              <FaLock aria-hidden="true" className="text-[11px]" />
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.1em]">
                Your documents
              </p>
            </div>

            <p className="m-0 mt-2.5 text-[12px] leading-[1.7] text-text-secondary">
              Uploaded files are read for their text and then discarded. Only the
              extracted text is stored, and only on your account.
            </p>

            <Button
              as={Link}
              to="/profile"
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
            >
              View saved reports
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
