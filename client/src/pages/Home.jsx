import { useReveal } from '../hooks/useReveal.js';
import { Approach } from '../components/home/Approach.jsx';
import { ClosingCta } from '../components/home/ClosingCta.jsx';
import { Hero } from '../components/home/Hero.jsx';
import { ParentTopics } from '../components/home/ParentTopics.jsx';

export default function Home() {
  useReveal();

  return (
    <>
      <Hero />
      <Approach />
      <ParentTopics />
      <ClosingCta />
    </>
  );
}
