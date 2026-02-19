"use client";

import styles from "@/styles/blog/FeaturedPosts.module.css";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { normalizeName } from "@/utils/renderText";
import SafeImage from "./SafeImage";

const DEFAULT_VISIBLE = 5;

const FeaturedPosts = ({ featuredPosts = [], nameLink = "" }) => {
  const [expanded, setExpanded] = useState(false);
  const [heights, setHeights] = useState({ collapsed: 0, expanded: 0 });

  const listRef = useRef(null);

  const linkBase = useMemo(() => {
    const clean = String(nameLink || "").trim().replace(/^\/+|\/+$/g, "");
    return clean || "hacks";
  }, [nameLink]);

  const items = useMemo(
    () => (Array.isArray(featuredPosts) ? featuredPosts : []),
    [featuredPosts]
  );

  if (!items.length) return null;

  const canToggle = items.length > DEFAULT_VISIBLE;

  const measure = () => {
    const ul = listRef.current;
    if (!ul) return;

    const children = Array.from(ul.children);
    if (!children.length) return;

    const visibleCount = Math.min(DEFAULT_VISIBLE, children.length);

    // Altura hasta el final del item #5 (incluye gaps por offsetTop)
    const lastVisible = children[visibleCount - 1];
    const collapsed = lastVisible.offsetTop + lastVisible.offsetHeight;

    // Altura total real del UL (todas las notas)
    const expandedH = ul.scrollHeight;

    setHeights({ collapsed, expanded: expandedH });
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;

    // Recalcula al cambiar tamaños (imágenes, fonts, responsive, etc.)
    const ro = new ResizeObserver(() => measure());
    ro.observe(ul);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxH = expanded ? heights.expanded : heights.collapsed;

  return (
    <aside className={styles.featuredSection} aria-labelledby="featured-title">
      <h3 id="featured-title" className={styles.featuredTitle}>
        Publicación destacada
      </h3>

      {/* Wrapper animable */}
      <div
        className={styles.listWrap}
        style={{ maxHeight: maxH ? `${maxH}px` : undefined }}
        data-expanded={expanded ? "true" : "false"}
      >
        <ul
          ref={listRef}
          className={styles.featuredList}
          data-expanded={expanded ? "true" : "false"}
          id="featured-list"
        >
          {items.map((post, index) => {
            const name = post?.name ?? "";
            const slug = normalizeName(name);
            const href = `/${linkBase}/${slug}`;

            return (
              <li
                key={`${slug || "featured"}-${post?.date || ""}-${index}`}
                className={styles.featuredItem}
              >
                <SafeImage
                  src={post?.image}
                  alt={name || "Imagen de la publicación"}
                  className={styles.featuredImage}
                  loading="lazy"
                  decoding="async"
                  fallbackSrc="/img/fallback.webp"
                />

                <div className={styles.featuredContent}>
                  {post?.date ? (
                    <p className={styles.featuredDate}>
                      <time dateTime={post.date}>{post.date}</time>
                    </p>
                  ) : (
                    <p className={styles.featuredDate} />
                  )}

                  <Link href={href} className={styles.featuredLink}>
                    {name}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {canToggle && (
        <div className={styles.toggleWrap}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="featured-list"
          >
            {expanded
              ? "Ver menos publicaciones"
              : `Ver más (${items.length - DEFAULT_VISIBLE})`}

            <span
              className={styles.toggleIcon}
              aria-hidden="true"
              data-expanded={expanded ? "true" : "false"}
            >
              ▼
            </span>
          </button>

          {!expanded && (
            <p className={styles.toggleHint}>
              Mostrando {Math.min(DEFAULT_VISIBLE, items.length)} de{" "}
              {items.length}
            </p>
          )}
        </div>
      )}
    </aside>
  );
};

export default FeaturedPosts;