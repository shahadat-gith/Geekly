


export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-20 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14">
        <div>


          <h1 className="max-w-[17ch] text-balance font-heading text-[42px] font-semibold leading-[1.06] tracking-[-0.04em] xs:text-[50px] sm:text-[58px] lg:text-[62px]">
            Grow as an engineer.
            <span className="text-[#527C42]"> Build with confidence.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-text-secondary sm:text-[16px]">
            Learn the fundamentals, understand complex systems, prepare for
            technical interviews, and build the skills to move your engineering
            career forward. Everything you need to become a stronger engineer,
            in one place.
          </p>


        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-soft/60 blur-2xl" />

          <div className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
            <img
              src="/hero.webp"
              alt="Illustration of engineering concepts and software systems"
              className="block h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
