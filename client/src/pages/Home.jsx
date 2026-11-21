import { useReveal } from '../hooks/useReveal.js';
import { Hero } from '../components/home/Hero.jsx';
import { Topics } from '../components/home/Topics.jsx';
import { ResumeIntelligenceCta } from '../components/home/ResumeIntelligenceCta.jsx';
import { HostingCta } from '../components/home/HostingCta.jsx';

export default function Home() {
  useReveal();

  return (
    <>
      <Hero />
      <Topics />
      <div className="mt-16 sm:mt-20">
        <ResumeIntelligenceCta />
      </div>
      <HostingCta />
    </>
  );
}
