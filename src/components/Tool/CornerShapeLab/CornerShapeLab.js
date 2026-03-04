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
  const [copied, setCopied] = useState(false);

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

  const borderRadiusValue = useMemo(() => {
    // A B C D / E F G H
    return `${values.A}% ${values.B}% ${values.C}% ${values.D}% / ${values.E}% ${values.F}% ${values.G}% ${values.H}%`;
  }, [values]);

  const generatedCss = useMemo(() => {
    // Dos modos: 1) directo (copiar y pegar) 2) con variables (más “pro”)
    // Aquí te doy ambos, para que copies el que quieras.
    const direct = [
      ".shape {",
      `  corner-shape: ${cornerShape};`,
      `  border-radius: ${borderRadiusValue};`,
      "}",
    ].join("\n");

    const withVars = [
      ":root {",
      `  --corner-shape: ${cornerShape};`,
      `  --border-radius-A: ${values.A}%;`,
      `  --border-radius-B: ${values.B}%;`,
      `  --border-radius-C: ${values.C}%;`,
      `  --border-radius-D: ${values.D}%;`,
      `  --border-radius-E: ${values.E}%;`,
      `  --border-radius-F: ${values.F}%;`,
      `  --border-radius-G: ${values.G}%;`,
      `  --border-radius-H: ${values.H}%;`,
      "}",
      "",
      ".shape {",
      "  corner-shape: var(--corner-shape);",
      "  border-radius: var(--border-radius-A) var(--border-radius-B) var(--border-radius-C) var(--border-radius-D) /",
      "    var(--border-radius-E) var(--border-radius-F) var(--border-radius-G) var(--border-radius-H);",
      "}",
    ].join("\n");

    return { direct, withVars };
  }, [cornerShape, borderRadiusValue, values]);

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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(copyToClipboard._t);
      copyToClipboard._t = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      window.clearTimeout(copyToClipboard._t);
      copyToClipboard._t = window.setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <section className={styles.container} aria-label="Corner shape lab">
      {/* ARRIBA: IZQUIERDA (CONTROLES) */}
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
            Tu navegador no soporta <code>corner-shape</code> aún. Se mostrará solo
            el efecto de <code>border-radius</code>.
          </div>
        )}
      </aside>

      {/* ARRIBA: DERECHA (PREVIEW) */}
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

      {/* ABAJO: CSS GENERATOR (FULL WIDTH) */}
      <div className={`${styles.card} ${styles.generatorCard}`}>
        <div className={styles.generator}>
          <div className={styles.genHeader}>
            <div>
              <p className={styles.genTitle}>CSS generado</p>
              <p className={styles.genSub}>Copia y pega para replicar la forma.</p>
            </div>

            <div className={styles.copyGroup}>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyToClipboard(generatedCss.direct)}
                title="Copiar CSS directo"
              >
                Copiar (Directo)
              </button>

              <button
                type="button"
                className={styles.copyBtnAlt}
                onClick={() => copyToClipboard(generatedCss.withVars)}
                title="Copiar CSS con variables"
              >
                Copiar (Vars)
              </button>
            </div>
          </div>

          {copied && <div className={styles.copied}>✅ Copiado</div>}

          <details className={styles.details} open>
            <summary className={styles.summary}>CSS directo</summary>
            <pre className={styles.codeBlock}>
              <code>{generatedCss.direct}</code>
            </pre>
          </details>

          <details className={styles.details}>
            <summary className={styles.summary}>CSS con variables</summary>
            <pre className={styles.codeBlock}>
              <code>{generatedCss.withVars}</code>
            </pre>
          </details>
        </div>
      </div>
    </section>
  );
}