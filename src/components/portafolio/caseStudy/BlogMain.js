"use client";
import BlogHeader from "@/shared/blogStructure/BlogHeader";
import BlogNoticias from "@/shared/blogStructure/BlogNoticias";
import { blogPosts } from "@/utils/portafolio/caseStudy";
import { categoryFilters } from "@/utils/portafolio/categoryFiltersCaseStudy";

const BlogMain = () => {
  // Solo posts con featuredPosts === true
  const featuredOnly = blogPosts.filter(p => p.featuredPosts === true);

  return (
    <div>
      <BlogHeader posts={blogPosts} />
      <BlogNoticias posts={blogPosts} featuredPosts={featuredOnly} categoryFilters={categoryFilters} />
    </div>
  );
};

export default BlogMain;

