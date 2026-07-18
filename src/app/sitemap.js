import { SITE_URL } from "@/config/site";
import { blogPosts } from "@/utils/blog/blogData";
import { normalizeName } from "@/utils/renderText";

export default function sitemap() {
  const pages = ["", "/hacks", "/portafolio"].map((path) => ({
    url: new URL(path || "/", SITE_URL).toString(),
    changeFrequency: path === "/hacks" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const posts = blogPosts.map((post) => ({
    url: new URL(`/hacks/${normalizeName(post.name)}`, SITE_URL).toString(),
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
    images: [new URL(post.image, SITE_URL).toString()],
  }));

  return [...pages, ...posts];
}
