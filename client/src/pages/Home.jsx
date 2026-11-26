import { Hero } from '../components/home/Hero.jsx';
import { Topics } from '../components/home/Topics.jsx';
import { ResumeIntelligenceCta } from '../components/home/ResumeIntelligenceCta.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <Topics />
      <ResumeIntelligenceCta />
    </>
  );
}
