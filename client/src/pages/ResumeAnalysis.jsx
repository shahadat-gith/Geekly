import { Link } from 'react-router-dom';

import { Button } from '../components/ui/Button.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { UploadForm } from '../components/resume/UploadForm.jsx';

const WHAT_YOU_GET = [
  {
    title: 'Requirement match',
    description: 'Which requirements your resume evidences, and where the evidence is thin.',
  },
  {
    title: 'Ordered fixes',
    description: 'Finished lines per section, ordered by the impact they have on this role.',
  },
  {
    title: 'A saved report',
    description: 'Every run is kept in your profile so you can compare revisions over time.',
  },
];

export default function ResumeAnalysis() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        eyebrow="Resume review"
        title="Check a resume against a role"
        description="Give us the resume you are sending and the posting you are targeting. You get the requirement match and the exact lines to paste in."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-14">
        <div className="min-w-0 rounded-card border border-border bg-surface p-5 sm:p-8">
          <UploadForm />
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24">
          <div className="border-t border-border pt-4">
            <p className="folio m-0">What you get</p>

            <ol className="m-0 mt-4 flex list-none flex-col p-0">
              {WHAT_YOU_GET.map(({ title, description }, index) => (
                <li
                  key={title}
                  className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 border-b border-border-secondary py-4 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className="folio pt-0.5">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <p className="m-0 text-[13.5px] font-medium text-text">{title}</p>
                    <p className="m-0 mt-1 text-[12.5px] leading-[1.7] text-text-secondary">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <p className="folio m-0">Documents</p>

            <p className="m-0 mt-3 text-[12.5px] leading-[1.75] text-text-secondary">
              Uploaded files are read for their text and then discarded. Only the
              extracted text is stored, on your account.
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
