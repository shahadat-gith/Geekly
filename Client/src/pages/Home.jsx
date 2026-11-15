import { useReveal } from '../hooks/useReveal.js';
import { Hero } from '../components/home/Hero.jsx';
import { ParentTopics } from '../components/home/ParentTopics.jsx';

export default function Home() {
  useReveal();

  return (
    <>
      <Hero />
      <ParentTopics />
    </>
  );
}
