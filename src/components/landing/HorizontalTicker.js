"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "@/styles/HorizontalTicker.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalTicker({
  leftImg = "/img/badges/observa.jpg",
  rightImg = "/img/badges/metrics.jpg",
  altLeft = "observa",
  altRight = "métricas",
}) {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    const getDistance = () => Math.max(0, line.scrollWidth - section.clientWidth);

    const context = gsap.context(() => {
      gsap.to(line, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "center center",
          end: () => `+=${Math.max(window.innerHeight * 1.25, getDistance() * 1.5)}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.wrapper} aria-label="Ticker horizontal">
      <div className={styles.line} ref={lineRef}>
        <span className={styles.chunk}>Lo que no</span>
        <Image
          src={leftImg}
          alt={altLeft}
          width={1000}
          height={667}
          sizes="(max-width: 700px) 150px, 240px"
          className={styles.badge}
        />
        <span className={styles.chunk}><em>se trackea</em></span>
        <Image
          src={rightImg}
          alt={altRight}
          width={1000}
          height={667}
          sizes="(max-width: 700px) 150px, 240px"
          className={styles.badge}
        />
        <span className={styles.chunk}>no escala</span>
      </div>
    </section>
  );
}
