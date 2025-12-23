"use client";
import React, { useMemo, useState } from "react";
import styles from "@/styles/blog/BlogNoticias.module.css";
import FeaturedPosts from "./FeaturedPosts";
import Link from "next/link";
import { normalizeName } from "@/utils/renderText";

const BlogNoticias = ({ posts = [], featuredPosts = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [fadeEffect, setFadeEffect] = useState(false);

  // Si deseas categorías dinámicas, descomenta esto y elimina el <options> fijo:
  // const categories = useMemo(
  //   () => ["Todas", ...Array.from(new Set(posts.map((p) => p.category))).filter(Boolean)],
  //   [posts]
  // );

  const handleCategoryChange = (event) => {
    setFadeEffect(true);
    setTimeout(() => {
      setSelectedCategory(event.target.value);
      setFadeEffect(false);
    }, 300);
  };

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Todas") return posts;
    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <section className={styles.blogNoticias}>
      {/* Columna principal */}
      <section className={styles.newsSection}>
        <header className={styles.newsHeader}>
          <h2 className={styles.headerTitle}>
            <span>Blog </span>
            <span className="span-doarado">ConCiencia Pública</span>
          </h2>

          <label htmlFor="catSelect" className={styles.srOnly}>
            Filtrar por categoría
          </label>
          <select
            id="catSelect"
            className={styles.orderSelect}
            onChange={handleCategoryChange}
            defaultValue="Todas"
            aria-label="Filtrar por categoría"
          >
            <option value="Todas">Todas</option>
            <option value="ZMVM">ZMVM</option>
            <option value="ZMP">ZMPachuca</option>
            <option value="ZMTula">ZMTula</option>
            <option value="ZMTulancingo">ZMTulancingo</option>
          </select>

          {/* Si usas categorías dinámicas, usa esto: */}
          {/* <select id="catSelect" className={styles.orderSelect} onChange={handleCategoryChange} defaultValue="Todas">
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select> */}
        </header>

        <div className={`${styles.newsGrid} ${fadeEffect ? styles.fadeOut : styles.fadeIn}`}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <article key={`${post.name}-${index}`} className={styles.newsItem}>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.name}
                    className={styles.newsImage}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                <div className={styles.newsContent}>
                  <p className={styles.newsMeta}>
                    {post.category} · <time dateTime={post.date}>{post.date}</time>
                  </p>

                  <h3 className={styles.newsTitle}>{post.name}</h3>

                  <div className={styles.newsDescription}>
                   
                  </div>
                </div>

                <Link
                  href={`/hacks/${normalizeName(post.name)}`}
                  className={styles.readMoreBtn}
                  aria-label={`Leer más sobre: ${post.name}`}
                >
                  Leer más
                </Link>
              </article>
            ))
          ) : (
            <p className={styles.noResults}>No se encontraron publicaciones para esta categoría.</p>
          )}
        </div>
      </section>

      {/* Sidebar (destacadas) */}
      <aside className={styles.sidebar} aria-label="Publicaciones destacadas">
        <FeaturedPosts featuredPosts={featuredPosts} />
      </aside>
    </section>
  );
};

export default BlogNoticias;
