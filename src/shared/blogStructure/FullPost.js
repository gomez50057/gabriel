"use client";

import FeaturedPosts from "./FeaturedPosts";
import styles from "@/styles/blog/FullPost.module.css";
import Navbar from "@/shared/Navbar";
import SafeImage from "@/shared/blogStructure/SafeImage";
import { renderDescription } from "@/utils/renderText";

export default function FullPost({ post, featuredPosts = [] }) {
  if (!post) {
    return (
      <>
        <Navbar />
        <main className={styles.layout}>
          <p className={styles.notFound}>La publicación no existe.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className={styles.postContainer}>
        {/* Nota principal */}
        <article className={styles.postContent} aria-labelledby="post-title">
          {post.image ? (
            <figure className={styles.hero}>
              <SafeImage
                src={post.image}
                alt={post.name || "Imagen de la publicación"}
                className={styles.postImage}
                loading="lazy"
                decoding="async"
                fallbackSrc="/img/placeholder.webp"
              />
            </figure>
          ) : null}

          <div className={styles.meta}>
            <p>
              {post.authorEmail || "Gabriel Gómez Gómez"} ·{" "}
              <time dateTime={post.date}>{post.date}</time>
            </p>
          </div>

          <h1 id="post-title" className={styles.title}>
            {post.name}
          </h1>

          <div className={styles.description}>
            <ul className={styles.list}>{renderDescription(post.description, styles)}</ul>
          </div>

          {post.quote && <blockquote className={styles.quote}>“{post.quote}”</blockquote>}
        </article>

        {featuredPosts?.length > 0 && (
          <aside className={styles.sidebar} aria-label="Publicaciones destacadas">
            <FeaturedPosts featuredPosts={featuredPosts} />
          </aside>
        )}
      </div>
    </>
  );
}
