"use client";

import { useEffect, useRef, useState } from "react";
import ScoreBadge from "./ScoreBadge";

export default function GameShell({
  eyebrow,
  title,
  description,
  current,
  total,
  score,
  feedback,
  onExit,
  children,
  styles,
}) {
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const cancelButtonRef = useRef(null);
  const continueButtonRef = useRef(null);

  useEffect(() => {
    if (!showExitConfirmation) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowExitConfirmation(false);
        requestAnimationFrame(() => cancelButtonRef.current?.focus());
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    continueButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showExitConfirmation]);

  const closeExitConfirmation = () => {
    setShowExitConfirmation(false);
    requestAnimationFrame(() => cancelButtonRef.current?.focus());
  };

  const confirmExit = () => {
    setShowExitConfirmation(false);
    onExit();
  };

  return (
    <section className={styles.gameShell} aria-labelledby="game-title">
      <header className={styles.gameHeader}>
        <div>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 id="game-title">{title}</h2>
          <p>{description}</p>
        </div>

        <div className={styles.gameHeaderActions}>
          {typeof current === "number" && typeof total === "number" && (
            <ScoreBadge label="Progreso" value={`${current} / ${total}`} styles={styles} />
          )}
          <ScoreBadge label="Puntos" value={score.toLocaleString("es-MX")} styles={styles} />
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.secondaryButton}
            onClick={() => setShowExitConfirmation(true)}
          >
            Cancelar
          </button>
        </div>
      </header>

      <div
        className={`${styles.liveRegion} ${feedback ? "" : styles.liveRegionEmpty}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback || " "}
      </div>

      {children}

      {showExitConfirmation && (
        <div
          className={styles.confirmOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeExitConfirmation();
          }}
        >
          <div
            className={styles.confirmDialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="exit-confirmation-title"
            aria-describedby="exit-confirmation-description"
          >
            <div className={styles.confirmIcon} aria-hidden="true">
              !
            </div>
            <div>
              <h3 id="exit-confirmation-title">¿Estás seguro de salir?</h3>
              <p id="exit-confirmation-description">
                El progreso de esta partida no se guardará. Tus mejores resultados anteriores se
                conservarán.
              </p>
            </div>
            <div className={styles.confirmActions}>
              <button
                ref={continueButtonRef}
                type="button"
                className={styles.secondaryButton}
                onClick={closeExitConfirmation}
              >
                Continuar jugando
              </button>
              <button type="button" className={styles.dangerButton} onClick={confirmExit}>
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
