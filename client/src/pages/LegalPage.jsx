import { Link } from 'react-router-dom';

const DOCS = {
  terms: {
    title: 'Terms and conditions',
    updated: 'Updated 24 November 2026',
    sections: [
      {
        heading: 'About Geekly',
        paragraphs: [
          'Geekly publishes educational articles about software engineering, including system design, databases, operating systems, networks and related topics. Reading is open to everyone and does not require an account.',
        ],
      },
      {
        heading: 'Accounts',
        paragraphs: [
          'You can create an account with an email address, Google or GitHub. Keep your password private and do not share your account. You are responsible for activity that happens under it.',
        ],
      },
      {
        heading: 'Content',
        paragraphs: [
          'Articles, examples and illustrations on Geekly are provided for personal learning. Do not republish them commercially, or present them as your own work, without permission.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: [
          'Do not attempt to disrupt the service, collect its content at scale, or use it for anything unlawful. We may suspend access that interferes with the site or with other readers.',
        ],
      },
      {
        heading: 'Availability and changes',
        paragraphs: [
          'Topics and lessons are updated over time. Geekly is provided as it is, and parts of it may change, move or be removed. These terms may be updated as the service changes.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'If you have a question about these terms, use the contact links in the footer.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    updated: 'Updated 24 November 2026',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'If you create an account, we store your name, email address and profile photo. When you sign in with Google or GitHub, those details come from the account you choose. If you register with email, we store a hashed version of your password, never the password itself.',
        ],
      },
      {
        heading: 'What we do not collect',
        paragraphs: [
          'Geekly does not ask for payment details and does not run advertising or analytics trackers.',
        ],
      },
      {
        heading: 'How we use your details',
        paragraphs: [
          'Your details are used to create your account, sign you in, keep your session active and let you reset your password. We do not use them for advertising.',
        ],
      },
      {
        heading: 'Where it is stored',
        paragraphs: [
          'Your session is kept in your browser so you stay signed in. Account details are stored on the servers that run Geekly.',
        ],
      },
      {
        heading: 'Third parties',
        paragraphs: [
          'If you choose Google or GitHub to sign in, the sign-in happens under their own privacy policies. Geekly only receives the details described above.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You can sign out at any time. To have your account and its details deleted, get in touch through the contact links in the footer.',
        ],
      },
    ],
  },
};

const sectionId = (heading) =>
  heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function LegalPage({ page }) {
  const doc = DOCS[page];
  const otherPage = page === 'terms' ? 'privacy' : 'terms';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand" />
        <p className="folio m-0">Legal</p>
        <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-border" />
        <p className="folio m-0">{doc.updated}</p>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[200px_minmax(0,68ch)] lg:gap-16">
        {/* Contents rail */}
        <nav
          aria-label="Document contents"
          className="min-w-0 lg:sticky lg:top-24 lg:self-start"
        >
          <p className="folio m-0">Contents</p>

          <ol className="m-0 mt-3 list-none p-0">
            {doc.sections.map((section, index) => (
              <li
                key={section.heading}
                className="border-b border-border-secondary first:border-t"
              >
                <a
                  href={`#${sectionId(section.heading)}`}
                  className="group flex gap-3 py-2.5 text-[12.5px] leading-snug text-text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="w-5 shrink-0 pt-px font-mono text-[10px] tabular-nums text-text-tertiary transition-colors group-hover:text-brand-strong">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{section.heading}</span>
                </a>
              </li>
            ))}
          </ol>

          <Link
            to={`/${otherPage}`}
            className="mt-8 inline-flex text-[12.5px] font-medium text-brand-strong transition-colors hover:text-brand-strong-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {otherPage === 'terms' ? 'Terms of service' : 'Privacy policy'}
          </Link>
        </nav>

        {/* Document */}
        <article className="min-w-0">
          <header className="border-b border-border pb-8">
            <h1 className="m-0 text-balance font-heading text-[32px] font-medium leading-[1.12] tracking-[-0.025em] text-text sm:text-[38px]">
              {doc.title}
            </h1>
          </header>

          <div>
            {doc.sections.map((section, index) => (
              <section
                key={section.heading}
                id={sectionId(section.heading)}
                className="scroll-mt-24 border-b border-border-secondary py-8 last:border-b-0"
              >
                <div className="grid gap-2 sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-4">
                  <span className="folio pt-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <h2 className="m-0 font-heading text-[18px] font-medium leading-snug tracking-[-0.015em] text-text">
                      {section.heading}
                    </h2>

                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-3 text-[15px] leading-[1.8] text-text-secondary"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
