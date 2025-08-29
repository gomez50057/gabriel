"use client";
import HeroHacks from "./HeroHacks";
import BlogHeader from "./BlogHeader";
import BlogNoticias from "./BlogNoticias";
// import UltimasNoticias from "./UltimasNoticias";
import { blogPosts } from "@/utils/blogData";

const BlogMain = () => {
  // Solo posts con featuredPosts === true
  const featuredOnly = blogPosts.filter(p => p.featuredPosts === true);

  return (
    <div>
      <HeroHacks />
      <BlogHeader />
      {/* <UltimasNoticias posts={blogPosts.slice(0, 4)} /> */}
      <BlogNoticias posts={blogPosts} featuredPosts={featuredOnly} />
    </div>
  );
};

export default BlogMain;
