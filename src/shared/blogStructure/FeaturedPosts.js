"use client";
import React, { useMemo } from "react";
import styles from "@/styles/blog/FeaturedPosts.module.css";
import Link from "next/link";
import { normalizeName } from "@/utils/renderText";

const FeaturedPosts = ({ featuredPosts = [], nameLink = "" }) => {
  const linkBase = useMemo(() => {
    const clean = String(nameLink || "").trim().replace(/^\/+|\/+$/g, "");
    return clean || "hacks";
  }, [nameLink]);

  const safeFeatured = Array.isArray(featuredPosts) ? featuredPosts : [];

  return (
    <aside className={styles.featuredSection}>
      <h3 className={styles.featuredTitle}>Publicación destacada</h3>

      <ul className={styles.featuredList}>
        {safeFeatured.map((post, index) => {
          const slug = normalizeName(post?.name ?? "");
          const href = `/${linkBase}/${slug}`;

          return (
            <li key={`${post?.name ?? "featured"}-${index}`} className={styles.featuredItem}>
              {post?.image && (
                <img
                  src={post.image}
                  alt={post?.name ?? "Publicación destacada"}
                  className={styles.featuredImage}
                  loading="lazy"
                  decoding="async"
                />
              )}

              <div className={styles.featuredContent}>
                <p className={styles.featuredDate}>
                  <time dateTime={post?.date}>{post?.date}</time>
                </p>

                <Link href={href} className={styles.featuredLink} aria-label={`Leer: ${post?.name ?? ""}`}>
                  {post?.name}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default FeaturedPosts;
