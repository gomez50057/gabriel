"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "@/styles/shared/HeroParallax.module.css";
import BlogMain from '@/components/blog/BlogMain';

gsap.registerPlugin(ScrollTrigger);

export default function HeroParallax({
  // Imagen de primer plano (la que hace zoom y “z”)
  foregroundSrc = "/img/heroParallax/hero-1.png",
  foregroundAlt = "Imagen principal",
  // Muestra marcadores de ScrollTrigger para depurar
  debug = false,
}) {
  const wrapperRef = useRef(null);
  const heroRef = useRef(null);
  const imgRef = useRef(null);

  useLayoutEffect(() => {
    // Respeta usuarios con “reduced motion”
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: true,
          markers: debug,
        },
      });

      tl.to(imgRef.current, {
        scale: 2,
        z: 350,
        transformOrigin: "center center",
        ease: "power1.inOut",
      }).to(
        heroRef.current,
        {
          scale: 1.1,
          transformOrigin: "center center",
          ease: "power1.inOut",
        },
        "<"
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, [debug]);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.content}>
        <BlogMain />
      </div>

      <div className={styles.imageContainer} aria-hidden="true">
        <img ref={imgRef} src={foregroundSrc} alt={foregroundAlt} />
      </div>
    </div>
  );
}
