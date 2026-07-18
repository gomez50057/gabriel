"use client";

import { useEffect, useMemo, useState } from "react";
import FeaturedPosts from "./FeaturedPosts";
import styles from "@/styles/blog/FullPost.module.css";
import Navbar from "@/shared/Navbar";
import SafeImage from "@/shared/blogStructure/SafeImage";
import { renderDescription } from "@/utils/renderText";

const getVideoType = (src = "") => {
  const extension = src.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
  if (!extension) return undefined;

  return `video/${extension === "mov" ? "quicktime" : extension}`;
};

const normalizeMediaItem = (item, post, index) => {
  if (typeof item === "string") {
    return {
      type: "image",
      src: item,
      alt: post.name || `Imagen ${index + 1} de la publicación`,
    };
  }

  if (!item?.src && !Array.isArray(item?.sources)) return null;

  const hasSources = Array.isArray(item.sources) && item.sources.length > 0;

  return {
    type: item.type || (hasSources ? "video" : "image"),
    alt: item.alt || post.name || `Media ${index + 1} de la publicación`,
    caption: item.caption,
    poster: item.poster,
    sources: item.sources,
    src: item.src,
  };
};

const getPostMedia = (post) => {
  const media = [];

  if (post.image) {
    media.push({
      type: "image",
      src: post.image,
      alt: post.name || "Imagen de la publicación",
    });
  }

  if (Array.isArray(post.media) && post.media.length > 0) {
    media.push(
      ...post.media
        .map((item, index) => normalizeMediaItem(item, post, media.length + index))
        .filter(Boolean)
    );
  }

  const added = new Set();

  return media.filter((item) => {
    const key = item.src || item.sources?.map((source) => source.src || source).join("|");
    if (!key) return true;
    if (added.has(key)) return false;

    added.add(key);
    return true;
  });
};

const renderMediaItem = (item, index, isCarouselItem = false) => {
  const figureClassName = isCarouselItem || index === 0 ? styles.hero : styles.mediaFigure;

  if (item.type === "video") {
    const sources = Array.isArray(item.sources) && item.sources.length > 0
      ? item.sources
      : [{ src: item.src, type: getVideoType(item.src) }];

    return (
      <figure key={`media-${index}`} className={figureClassName}>
        <video
          className={styles.postVideo}
          controls
          preload="metadata"
          poster={item.poster}
        >
          {sources.map((source, sourceIndex) => (
            <source
              key={`source-${sourceIndex}`}
              src={typeof source === "string" ? source : source.src}
              type={typeof source === "string" ? getVideoType(source) : source.type}
            />
          ))}
          Tu navegador no puede reproducir este video.
        </video>
        {item.caption && <figcaption className={styles.figCaption}>{item.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure key={`media-${index}`} className={figureClassName}>
      <SafeImage
        src={item.src}
        alt={item.alt || "Imagen de la publicación"}
        className={styles.postImage}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 900px) calc(100vw - 32px), 900px"
        fallbackSrc="/img/placeholder.webp"
      />
      {item.caption && <figcaption className={styles.figCaption}>{item.caption}</figcaption>}
    </figure>
  );
};

const CarouselArrow = ({ direction }) => (
  <svg
    aria-hidden="true"
    className={styles.carouselIcon}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {direction === "prev" ? (
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

export default function FullPost({ post, featuredPosts = [] }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const postMedia = useMemo(() => (post ? getPostMedia(post) : []), [post]);
  const highlightedPosts = useMemo(
    () => featuredPosts.filter((item) => item?.featuredPosts === true),
    [featuredPosts]
  );
  const activeMedia = postMedia[activeMediaIndex] || postMedia[0];
  const hasCarouselControls = postMedia.length > 1;

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [post?.name]);

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
          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <a href="/">Inicio</a>
            <span aria-hidden="true">/</span>
            <a href="/hacks">Hacks</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Artículo</span>
          </nav>

          {activeMedia && (
            <div
              className={styles.mediaGallery}
              aria-label="Galería de la publicación"
              aria-roledescription="carrusel"
            >
              <div className={styles.carouselViewport}>
                {renderMediaItem(activeMedia, activeMediaIndex, true)}
              </div>

              {hasCarouselControls && (
                <>
                  <button
                    type="button"
                    className={`${styles.carouselButton} ${styles.carouselButtonPrev}`}
                    aria-label="Ver elemento anterior"
                    onClick={() =>
                      setActiveMediaIndex((current) =>
                        current === 0 ? postMedia.length - 1 : current - 1
                      )
                    }
                  >
                    <CarouselArrow direction="prev" />
                  </button>

                  <button
                    type="button"
                    className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
                    aria-label="Ver elemento siguiente"
                    onClick={() =>
                      setActiveMediaIndex((current) =>
                        current === postMedia.length - 1 ? 0 : current + 1
                      )
                    }
                  >
                    <CarouselArrow direction="next" />
                  </button>

                  <div className={styles.carouselMeta}>
                    <span className={styles.carouselCounter}>
                      {activeMediaIndex + 1} / {postMedia.length}
                    </span>

                    <div className={styles.carouselDots} aria-label="Seleccionar elemento">
                      {postMedia.map((item, index) => (
                        <button
                          key={`${item.src || item.type}-${index}`}
                          type="button"
                          className={`${styles.carouselDot} ${
                            index === activeMediaIndex ? styles.carouselDotActive : ""
                          }`}
                          aria-label={`Ver elemento ${index + 1}`}
                          aria-current={index === activeMediaIndex ? "true" : undefined}
                          onClick={() => setActiveMediaIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className={styles.meta}>
            <p>
              {post.author} · Publicado el{" "}
              <time dateTime={post.publishedAt}>{post.date}</time>
              {post.updatedAt !== post.publishedAt && (
                <> · Actualizado el <time dateTime={post.updatedAt}>{post.updatedAt}</time></>
              )}
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

        {highlightedPosts.length > 0 && (
          <aside className={styles.sidebar} aria-label="Publicaciones destacadas">
            <FeaturedPosts featuredPosts={highlightedPosts} />
          </aside>
        )}
      </div>
    </>
  );
}
