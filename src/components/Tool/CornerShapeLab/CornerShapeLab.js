"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CornerShapeLab.module.css";

const KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const SHAPES = [
  { value: "round", label: "Round" },
  { value: "squircle", label: "Squircle" },
  { value: "scoop", label: "Scoop" },
  { value: "bevel", label: "Bevel" },
  { value: "notch", label: "Notch" },
  { value: "square", label: "Square" },
];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export default function CornerShapeLab() {
  const [cornerShape, setCornerShape] = useState("notch");
  const [values, setValues] = useState(() => {
    const initial = {};
    KEYS.forEach((k) => (initial[k] = 20));
    return initial;
  });

  const [supportsCornerShape, setSupportsCornerShape] = useState(true);

  useEffect(() => {
    try {
      const ok =
        typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("corner-shape: notch");
      setSupportsCornerShape(Boolean(ok));
    } catch {
      setSupportsCornerShape(false);
    }
  }, []);

  const shapeStyle = useMemo(() => {
    const cssVars = { "--corner-shape": cornerShape };
    KEYS.forEach((k) => {
      cssVars[`--border-radius-${k}`] = `${values[k]}%`;
    });
    return cssVars;
  }, [cornerShape, values]);

  const onRangeChange = (key) => (e) => {
    const next = clamp(Number(e.target.value), 0, 50);
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const randomize = () => {
    setValues(() => {
      const next = {};
      KEYS.forEach((k) => (next[k] = Math.round(Math.random() * 40 + 10)));
      return next;
    });
    setCornerShape(SHAPES[Math.floor(Math.random() * SHAPES.length)].value);
  };

  return (
    <section className={styles.container} aria-label="Corner shape lab">
      <aside className={styles.card}>
        <div className={styles.ranges}>
          {KEYS.map((k) => (
            <div key={k} className={styles.sliderCol} data-value={k}>
              <span className={styles.sliderLabel}>{k}</span>
              <input
                type="range"
                min="0"
                max="50"
                value={values[k]}
                onChange={onRangeChange(k)}
                aria-label={`Radio ${k}`}
                style={{ "--val": values[k] }}
              />
            </div>
          ))}
        </div>

        <select
          className={styles.select}
          value={cornerShape}
          onChange={(e) => setCornerShape(e.target.value)}
          aria-label="Selecciona corner-shape"
        >
          {SHAPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button type="button" className={styles.btn} onClick={randomize}>
          Randomize
        </button>

        {!supportsCornerShape && (
          <div className={styles.supportNote} role="note">
            Tu navegador no soporta <code>corner-shape</code> aún. Se mostrará
            solo el efecto de <code>border-radius</code>.
          </div>
        )}
      </aside>

      <div className={styles.card}>
        <div className={styles.canvas}>
          <div className={styles.shape} style={shapeStyle}>
            <div className={`${styles.mark} ${styles.top}`} data-value="A" />
            <div className={`${styles.mark} ${styles.top}`} data-value="B" />
            <div className={`${styles.mark} ${styles.bottom}`} data-value="C" />
            <div className={`${styles.mark} ${styles.bottom}`} data-value="D" />
            <div className={`${styles.mark} ${styles.left}`} data-value="E" />
            <div className={`${styles.mark} ${styles.right}`} data-value="F" />
            <div className={`${styles.mark} ${styles.right}`} data-value="G" />
            <div className={`${styles.mark} ${styles.left}`} data-value="H" />
          </div>
        </div>
      </div>
    </section>
  );
}