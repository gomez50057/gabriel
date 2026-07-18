import React from 'react';
import Navbar from '@/shared/Navbar';
import HeroParallax from "@/shared/HeroParallax";
import Footer from '@/shared/Footer';

const description =
  "Tutoriales y notas prácticas sobre desarrollo web, Next.js, Django, DevOps, seguridad y optimización.";

export const metadata = {
  title: "Hacks y tutoriales de desarrollo web",
  description,
  alternates: { canonical: "/hacks" },
  openGraph: {
    title: "Hacks y tutoriales de desarrollo web",
    description,
    url: "/hacks",
  },
  twitter: {
    title: "Hacks y tutoriales de desarrollo web",
    description,
  },
};


const News = () => {
  return (
    <div>
      <Navbar />
      <HeroParallax debug={false} />
      <Footer />
    </div>
  );
};

export default News;
