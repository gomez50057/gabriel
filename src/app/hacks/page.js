import React from 'react';
import Navbar from '@/shared/Navbar';
import HeroParallax from "@/shared/HeroParallax";
import Footer from '@/shared/Footer';


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
