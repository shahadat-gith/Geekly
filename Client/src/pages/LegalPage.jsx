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

  return (
    <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <h1 className="font-heading text-[40px] font-normal leading-[1.02] tracking-[-0.025em] sm:text-[52px]">
        {doc.title}
      </h1>
      <p className="mt-3 text-[12.5px] text-text-tertiary">{doc.updated}</p>

      <div className="mt-10 space-y-8 border-t border-border pt-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="m-0 text-[16px] font-semibold leading-snug tracking-[-0.01em]">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-2 text-[14.5px] leading-[1.75] text-text-secondary"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
