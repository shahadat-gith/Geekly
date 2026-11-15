import { Card } from '../ui/Card.jsx';
import { useTheme } from '../../context/themeContext.js';

export function Hero() {
  const { theme } = useTheme();

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pb-24 sm:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
        <div>
          <h1 className="max-w-[16ch] text-balance font-heading text-[52px] font-normal leading-[0.95] tracking-[-0.025em] xs:text-[62px] sm:text-[76px] lg:text-[80px]">
            Understand <span className="italic text-brand">“how”</span>.
          </h1>

          <p className="mt-7 max-w-xl text-[15.5px] leading-[1.75] text-text-secondary sm:text-[16.5px]">
            Geekly explains system design, databases, operating systems and networks in plain
            language — with worked examples and the questions interviews actually ask. Written for
            students and early-career engineers.
          </p>
        </div>

        <Card className="overflow-hidden border border-border">
          <img
            src={theme === 'dark' ? '/hero_dark.webp' : '/hero_light.webp'}
            alt="System design diagram showing a client, load balancer, application servers, cache, database, message queue and workers"
            className="aspect-[3/2] w-full object-cover"
          />
        </Card>
      </div>
    </section>
  );
}
