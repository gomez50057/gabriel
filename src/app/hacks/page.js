import React from 'react';
import Navbar from '@/components/landing/Header';
import HeroParallax from "@/shared/HeroParallax";

const News = () => {
  return (
    <div>
      <Navbar />
      <HeroParallax debug={false} />
    </div>
  );
};

export default News;
