import { Link } from 'react-router-dom';

const DOCS = {
  terms: {
    title: 'Terms and conditions',
    updated: 'Last updated November 2026',
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
    updated: 'Last updated November 2026',
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

export default function LegalPage({ page }) {
  const doc = DOCS[page];
  const otherPage = page === 'terms' ? 'privacy' : 'terms';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-14">
        {/* Contents rail */}
        <nav aria-label="Document contents" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow m-0">On this page</p>

          <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0 lg:flex-col">
            {doc.sections.map((section) => {
              const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');

              return (
                <li key={section.heading}>
                  <a
                    href={`#${id}`}
                    className="inline-flex min-h-9 items-center rounded-button border border-border-secondary bg-surface px-2.5 text-[12px] leading-snug text-text-secondary transition-colors hover:border-brand-light hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-0 lg:border-0 lg:bg-transparent lg:px-0"
                  >
                    {section.heading}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 border-t border-border-secondary pt-4">
            <Link
              to={`/${otherPage}`}
              className="text-[12.5px] font-medium text-brand-strong transition-colors hover:text-brand-strong-hover focus-visible:outline-none"
            >
              {otherPage === 'terms' ? 'Terms of service' : 'Privacy policy'}
            </Link>
          </div>
        </nav>

        {/* Document */}
        <article className="min-w-0">
          <header className="border-b border-border pb-6">
            <h1 className="text-balance font-heading text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[36px]">
              {doc.title}
            </h1>
            <p className="m-0 mt-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary">
              {doc.updated}
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-8">
            {doc.sections.map((section) => {
              const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');

              return (
                <section key={section.heading} id={id} className="scroll-mt-24">
                  <h2 className="m-0 text-[17px] font-semibold leading-snug tracking-[-0.015em] text-text">
                    {section.heading}
                  </h2>

                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-2.5 text-[14px] leading-[1.8] text-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
