import FullPost from "@/shared/blogStructure/FullPost";
import Footer from "@/shared/Footer";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/config/site";
import { blogPosts } from "@/utils/blog/blogData";
import { normalizeName } from "@/utils/renderText";
import { notFound } from "next/navigation";

const findPost = (name) =>
  blogPosts.find((post) => normalizeName(post.name) === name);

const getSummary = (post) => {
  const firstParagraph = post.description?.find(
    (block) => block?.type === "p" && block.text
  )?.text;
  const text = (firstParagraph || post.name)
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= 160) return text;
  return `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
};

const getSocialImage = (post) =>
  post.image?.toLowerCase().endsWith(".svg")
    ? "/img/social/gabriel-gomez-open-graph.png"
    : post.image;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ name: normalizeName(post.name) }));
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  const post = findPost(name);
  if (!post) return {};

  const path = `/hacks/${name}`;
  const description = getSummary(post);
  const socialImage = getSocialImage(post);

  return {
    title: post.name,
    description,
    authors: [{ name: post.author, url: SITE_URL }],
    category: post.category,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.name,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "es_MX",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [SITE_URL],
      tags: [post.category],
      images: [{ url: socialImage, alt: post.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.name,
      description,
      images: [socialImage],
    },
  };
}

export default async function PostPage({ params }) {
  const { name } = await params;
  const post = findPost(name);
  if (!post) notFound();

  const path = `/hacks/${name}`;
  const description = getSummary(post);
  const url = new URL(path, SITE_URL).toString();
  const image = new URL(getSocialImage(post), SITE_URL).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.name,
        description,
        image: [image],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        articleSection: post.category,
        inLanguage: "es-MX",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Person", name: post.author, url: SITE_URL },
        publisher: { "@type": "Person", name: AUTHOR_NAME, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Hacks",
            item: new URL("/hacks", SITE_URL).toString(),
          },
          { "@type": "ListItem", position: 3, name: post.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <FullPost post={post} featuredPosts={blogPosts} />
      <Footer />
    </>
  );
}
