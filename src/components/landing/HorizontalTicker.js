"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "@/styles/HorizontalTicker.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalTicker({
  leftImg = "/img/badges/observa.webp",  // <- cámbialas por las tuyas
  rightImg = "/img/badges/metrics.webp", // <- cámbialas por las tuyas
  altLeft = "observa",
  altRight = "métricas",
}) {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  const ctx = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;

    const setup = () => {
      const vw = window.innerWidth;
      const contentW = line.scrollWidth;
      const distance = Math.max(0, contentW - vw);

      const fromX = 0;
      const toX = -distance;

      ctx.current?.revert();
      ctx.current = gsap.context(() => {
        gsap.fromTo(
          line,
          { x: fromX },
          {
            x: toX,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: `+=${distance}`, // longitud de recorrido
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }, section);
    };

    setup();
    // Recalcular en resize/orientación
    const onResize = () => {
      ScrollTrigger.refresh();
      setup();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.current?.revert();
      ScrollTrigger.killAll(false, sectionRef.current);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.wrapper} aria-label="Ticker horizontal">
      <div className={styles.line} ref={lineRef}>
        <span className={styles.chunk}>Lo que no</span>
        <img src={leftImg} alt={altLeft} className={styles.badge} />
        <span className={styles.chunk}><em>se trackea</em></span>
        <img src={rightImg} alt={altRight} className={styles.badge} />
        <span className={styles.chunk}>no escala</span>
      </div>
    </section>
  );
}
