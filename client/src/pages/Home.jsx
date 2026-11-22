import { Hero } from '../components/home/Hero.jsx';
import { Topics } from '../components/home/Topics.jsx';
import { ResumeIntelligenceCta } from '../components/home/ResumeIntelligenceCta.jsx';
import { HostingCta } from '../components/home/HostingCta.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <Topics />
      <ResumeIntelligenceCta />
      <HostingCta />
    </>
  );
}
