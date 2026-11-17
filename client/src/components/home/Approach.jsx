const POINTS = [
  {
    title: 'Start from the problem',
    body: 'A lesson opens with the situation that makes a concept necessary — a slow page, a lost write — then shows the mechanism that fixes it.',
  },
  {
    title: 'Make it visible',
    body: 'Diagrams and code walkthroughs sit beside the explanation, so you follow the path instead of memorising the terms.',
  },
  {
    title: 'Name the trade-offs',
    body: 'Every choice costs something. Lessons say what you gain, what you give up, and how to explain the decision in a design review.',
  },
];

export function Approach() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)] lg:gap-16">
          <h2 className="max-w-sm text-balance font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] sm:text-[32px]">
            How the lessons work
          </h2>

          <div className="grid gap-8 sm:grid-cols-3 sm:gap-7">
            {POINTS.map((point) => (
              <div key={point.title} className="border-t border-border pt-5">
                <h3 className="m-0 text-[14.5px] font-semibold leading-snug tracking-[-0.01em]">
                  {point.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-text-secondary">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
