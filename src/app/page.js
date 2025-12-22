// src/app/page.js
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import AboutMe from '@/components/landing/AboutMe';
import HorizontalTicker from '@/components/landing/HorizontalTicker';
import Skills from '@/components/landing/Skills';
import Portfolio from '@/components/landing/Portfolio';
import Contact from '@/components/landing/Contact';
import Footer from '@/shared/Footer';


export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AboutMe />
        <HorizontalTicker />
        <Skills />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
