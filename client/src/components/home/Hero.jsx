export function Hero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:gap-16">
        <div>
          <h1 className="m-0 max-w-[16ch] text-balance font-heading text-[40px] font-medium leading-[1.05] tracking-[-0.03em] text-text xs:text-[48px] sm:text-[56px] lg:text-[60px]">
            Everything an engineer needs, in one place
          </h1>

          <p className="mt-6 max-w-[50ch] text-[15px] leading-[1.75] text-text-secondary sm:text-[16px]">
            Geekly covers backend, databases, operating systems and system
            design, compares your resume with a real job posting, and puts your
            own site online — with more tools on the way.
          </p>
        </div>

        <figure className="m-0 overflow-hidden rounded-panel border border-border bg-surface">
          <img
            src="/hero.webp"
            width="1536"
            height="1024"
            alt="Diagram of a web request passing through a client, load balancer and application servers to a cache, a database, a message queue and background workers"
            loading="eager"
            fetchPriority="high"
            className="block h-auto w-full"
          />
        </figure>
      </div>
    </section>
  );
}
