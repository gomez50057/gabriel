"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import styles from "./BlogHeader.module.css";
import Link from "next/link";
import { normalizeName, blogPosts } from "@/utils/blogData";

// === Tomar únicamente los 4 últimos posts (el más nuevo primero) ===
const POSTS = blogPosts.slice(0, 4);

const BlogHeader = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [manualChange, setManualChange] = useState(false);

  // swipe refs
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const SWIPE_THRESHOLD = 40; // px

  useEffect(() => {
    // asegurar índice válido si cambiara la fuente de datos
    if (activeIndex >= POSTS.length) setActiveIndex(0);
  }, [activeIndex]);

  useEffect(() => {
    setAnimationKey((k) => k + 1);
  }, [activeIndex]);

  // auto-advance (pausa si hubo cambio manual breve)
  useEffect(() => {
    if (!manualChange && POSTS.length > 1) {
      const id = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % POSTS.length);
      }, 6000);
      return () => clearInterval(id);
    }
  }, [manualChange]);

  const restartAutoAdvance = () => setManualChange(false);

  const handleNext = useCallback(() => {
    if (!POSTS.length) return;
    setManualChange(true);
    setActiveIndex((prev) => (prev + 1) % POSTS.length);
    restartAutoAdvance();
  }, []);

  const handlePrev = useCallback(() => {
    if (!POSTS.length) return;
    setManualChange(true);
    setActiveIndex((prev) => (prev - 1 + POSTS.length) % POSTS.length);
    restartAutoAdvance();
  }, []);

  const getNextIndex = (index, offset) =>
    POSTS.length ? (index + offset) % POSTS.length : 0;

  const handlePreviewClick = (index) => {
    setManualChange(true);
    setActiveIndex(index);
    restartAutoAdvance();
  };

  // accesibilidad: teclado ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  // gestos táctiles
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      dx < 0 ? handleNext() : handlePrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!POSTS.length) return null;

  return (
    <section
      className={styles.container}
      style={{ backgroundImage: `url(${POSTS[activeIndex].image})` }}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Encabezado de blog con carrusel"
      aria-live="polite"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <h2
          key={`${animationKey}-name`}
          className={`${styles.name} ${styles.textAnimation} delay-1`}
        >
          {POSTS[activeIndex].name}
        </h2>

        <p
          key={`${animationKey}-date`}
          className={`${styles.date} ${styles.textAnimation} delay-2`}
        >
          {POSTS[activeIndex].date}
        </p>

        <Link href={`/hacks/${normalizeName(POSTS[activeIndex].name)}`} passHref>
          <button
            key={`${animationKey}-button`}
            className={`${styles.ctaBtn} ${styles.textAnimation} delay-3`}
            aria-label={`Leer más: ${POSTS[activeIndex].name}`}
          >
            Leer más
          </button>
        </Link>
      </div>

      <div className={styles.previewContainer} aria-hidden="true">
        {Array(2)
          .fill(null)
          .map((_, offset) => {
            const nextIndex = getNextIndex(activeIndex, offset + 1);
            return (
              <button
                key={nextIndex}
                className={`${styles.previewItem} ${styles.slideAnimation}`}
                style={{ backgroundImage: `url(${POSTS[nextIndex].image})` }}
                onClick={() => handlePreviewClick(nextIndex)}
                aria-label={`Ir a: ${POSTS[nextIndex].name}`}
              />
            );
          })}
      </div>

      <div className={styles.navButtons}>
        <button className={styles.prevButton} onClick={handlePrev} aria-label="Anterior">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button className={styles.nextButton} onClick={handleNext} aria-label="Siguiente">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default BlogHeader;
