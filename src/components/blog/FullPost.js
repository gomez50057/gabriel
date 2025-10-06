"use client";

import FeaturedPosts from "./FeaturedPosts";
import styles from "./FullPost.module.css";
import Navbar from "@/components/landing/Header";
import { renderDescription } from "@/utils/blogData";

export default function FullPost({ post, featuredPosts = [] }) {
  if (!post) return <p>La publicación no existe.</p>;

  return (
    <>
      <Navbar />

      <div className={styles.postContainer}>
        {/* Nota principal */}
        <article className={styles.postContent} aria-labelledby="post-title">
          {post.image && (
            <img
              src={post.image}
              alt={post.name}
              className={styles.postImage}
              decoding="async"
              fetchPriority="high"
            />
          )}

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
            <ul className={styles.list}>{renderDescription(post.description)}</ul>
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
