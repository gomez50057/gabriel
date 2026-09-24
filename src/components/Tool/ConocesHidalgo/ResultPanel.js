"use client";

import { useEffect } from "react";
import ScoreBadge from "./ScoreBadge";

export default function ResultPanel({ result, bestResult, onReplay, onBack, styles }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <section className={styles.resultPanel} aria-labelledby="result-title">
      <span className={styles.eyebrow}>Reto terminado</span>
      <h2 id="result-title">¡Felicidades!</h2>
      <p>
        Has obtenido <strong>{result.score.toLocaleString("es-MX")} puntos</strong>. Reconocimiento:{" "}
        <strong>{result.recognition}</strong>.
      </p>

      <div className={styles.resultMetrics}>
        <ScoreBadge label="Aciertos" value={`${result.correct} de ${result.total}`} styles={styles} />
        <ScoreBadge label="Precisión" value={`${result.percentage}%`} styles={styles} />
        <ScoreBadge label="Errores" value={result.incorrect} styles={styles} />
        <ScoreBadge
          label="Mejor puntaje"
          value={Math.max(result.score, bestResult?.bestScore || 0).toLocaleString("es-MX")}
          styles={styles}
        />
      </div>

      {result.details && <div className={styles.resultDetails}>{result.details}</div>}

      <div className={styles.actionRow}>
        <button type="button" className={styles.primaryButton} onClick={onReplay}>
          Volver a jugar
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Ver otros minijuegos
        </button>
      </div>
    </section>
  );
}
