"use client";
import HeroHacks from "@/shared/blogStructure/HeroHacks";
import BlogHeader from "@/shared/blogStructure/BlogHeader";
import BlogNoticias from "@/shared/blogStructure/BlogNoticias";
import { blogPosts } from "@/utils/blog/blogData";
import { categoryFilters } from "@/utils/blog/categoryFiltersBlog";

const BlogMain = () => {
  // Solo posts con featuredPosts === true
  const featuredOnly = blogPosts.filter(p => p.featuredPosts === true);

  return (
    <div>
      <HeroHacks />
      <BlogHeader posts={blogPosts} />
      <BlogNoticias posts={blogPosts} featuredPosts={featuredOnly} categoryFilters={categoryFilters} />
    </div>
  );
};

export default BlogMain;
