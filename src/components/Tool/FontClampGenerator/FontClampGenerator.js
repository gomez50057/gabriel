"use client";

import { useMemo, useState } from "react";
import styles from "./FontClampGenerator.module.css";

export default function FontClampGenerator() {
  const [minVW, setMinVW] = useState(320);
  const [maxVW, setMaxVW] = useState(1280);
  const [minFS, setMinFS] = useState(14);
  const [maxFS, setMaxFS] = useState(24);

  const result = useMemo(() => {
    const _minVW = Number(minVW);
    const _maxVW = Number(maxVW);
    const _minFS = Number(minFS);
    const _maxFS = Number(maxFS);

    if (
      !Number.isFinite(_minVW) ||
      !Number.isFinite(_maxVW) ||
      !Number.isFinite(_minFS) ||
      !Number.isFinite(_maxFS)
    ) {
      return { error: "Por favor ingresa números válidos." };
    }

    if (_minVW <= 0 || _maxVW <= 0) {
      return { error: "Los anchos de la ventana deben ser mayores a 0." };
    }

    if (_maxVW <= _minVW) {
      return { error: "El ancho máximo debe ser mayor que el ancho mínimo." };
    }

    if (_minFS <= 0 || _maxFS <= 0) {
      return { error: "Los tamaños de fuente deben ser mayores a 0." };
    }

    if (_maxFS < _minFS) {
      return { error: "El tamaño máximo de fuente debe ser mayor o igual al mínimo." };
    }

    // Fórmula estándar:
    // slope = (maxFS - minFS) / (maxVW - minVW) * 100
    // intercept = minFS - slope * (minVW / 100)
    const slope = ((_maxFS - _minFS) / (_maxVW - _minVW)) * 100;
    const intercept = _minFS - (slope * _minVW) / 100;

    const slopeFixed = Number.isFinite(slope) ? slope.toFixed(4) : "0";
    const interceptFixed = Number.isFinite(intercept) ? intercept.toFixed(4) : "0";

    const preferred = `calc(${interceptFixed}px + ${slopeFixed}vw)`;
    const clamp = `clamp(${_minFS}px, ${preferred}, ${_maxFS}px)`;

    return {
      error: "",
      slope,
      intercept,
      preferred,
      clamp,
      cssLine: `font-size: ${clamp};`,
    };
  }, [minVW, maxVW, minFS, maxFS]);

  const previewStyle = result?.clamp
    ? { fontSize: result.clamp }
    : undefined;

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Font-size Clamp Generator</h2>
        <p className={styles.subtitle}>
          Genera una regla <code>clamp()</code> para tipografía fluida entre dos anchos de viewport.
        </p>
      </header>

      <div className={styles.grid}>
        {/* Panel de entrada */}
        <div className={styles.panel}>
          <div className={styles.field}>
            <label>Ancho mínimo de la ventana gráfica (px)</label>
            <input
              type="number"
              value={minVW}
              onChange={(e) => setMinVW(e.target.value)}
              min={1}
              step={1}
            />
          </div>

          <div className={styles.field}>
            <label>Ancho máximo de la ventana gráfica (px)</label>
            <input
              type="number"
              value={maxVW}
              onChange={(e) => setMaxVW(e.target.value)}
              min={1}
              step={1}
            />
          </div>

          <div className={styles.field}>
            <label>Tamaño mínimo de fuente (px)</label>
            <input
              type="number"
              value={minFS}
              onChange={(e) => setMinFS(e.target.value)}
              min={1}
              step={0.5}
            />
          </div>

          <div className={styles.field}>
            <label>Tamaño máximo de fuente (px)</label>
            <input
              type="number"
              value={maxFS}
              onChange={(e) => setMaxFS(e.target.value)}
              min={1}
              step={0.5}
            />
          </div>

          {result.error ? (
            <div className={styles.errorBox}>
              {result.error}
            </div>
          ) : (
            <div className={styles.helpBox}>
              Ajusta valores para generar el clamp automáticamente.
            </div>
          )}
        </div>

        {/* Panel de salida */}
        <div className={styles.panel}>
          <label className={styles.label}>Resultado</label>

          <div className={styles.resultBlock}>
            <div className={styles.resultRow}>
              <span className={styles.resultKey}>clamp()</span>
              <code className={styles.code}>{result.clamp || "—"}</code>
            </div>

            <div className={styles.resultRow}>
              <span className={styles.resultKey}>CSS</span>
              <code className={styles.code}>{result.cssLine || "—"}</code>
            </div>
          </div>

          <label className={styles.label}>Vista previa</label>
          <div className={styles.preview} style={previewStyle}>
            Este texto usa tu clamp generado
          </div>

          <div className={styles.meta}>
            {!result.error && result.slope != null && result.intercept != null && (
              <>
                <span>
                  <strong>Pendiente:</strong> {result.slope.toFixed(6)}
                </span>
                <span>
                  <strong>Intercepto:</strong> {result.intercept.toFixed(6)}px
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
