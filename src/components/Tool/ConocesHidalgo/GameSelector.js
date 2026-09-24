"use client";

import { useEffect, useRef, useState } from "react";

const GAME_ICONS = {
  "municipios-escritos": "84",
  "ubica-municipio": "⌖",
  "identifica-municipio": "?",
  "region-municipio": "R",
  "adivina-municipio": "…",
};

export default function GameSelector({ games, progress, onSelect, styles }) {
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const levelOneButtonRef = useRef(null);

  useEffect(() => {
    if (!levelDialogOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setLevelDialogOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    levelOneButtonRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [levelDialogOpen]);

  const handleGameSelect = (gameId) => {
    if (gameId === "municipios-escritos") {
      setLevelDialogOpen(true);
      return;
    }

    onSelect(gameId);
  };

  const handleLevelSelect = (level) => {
    setLevelDialogOpen(false);
    onSelect("municipios-escritos", level);
  };

  return (
    <section className={styles.selectorSection} aria-labelledby="games-title">
      <div className={styles.sectionHeader}>
        <h2 id="games-title">Elige cómo quieres jugar</h2>
        <p>Puedes iniciar cualquier reto, repetirlo o cambiar a otro cuando quieras.</p>
      </div>

      <div className={styles.gameGrid}>
        {games.map((game) => {
          const saved = progress.games[game.id];

          return (
            <article key={game.id} className={styles.gameCard}>
              <div className={styles.gameIcon} aria-hidden="true">
                {GAME_ICONS[game.id]}
              </div>
              <div className={styles.gameCardBody}>
                <span>{game.duration}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
              </div>
              <div className={styles.gameCardFooter}>
                <span>
                  {saved
                    ? `Mejor: ${saved.bestScore.toLocaleString("es-MX")} puntos`
                    : "Sin partidas guardadas"}
                </span>
                <button type="button" className={styles.primaryButton} onClick={() => handleGameSelect(game.id)}>
                  Iniciar reto
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {levelDialogOpen && (
        <div
          className={styles.confirmOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLevelDialogOpen(false);
          }}
        >
          <div
            className={styles.levelDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="municipalities-level-title"
            aria-describedby="municipalities-level-description"
          >
            <div>
              <span className={styles.eyebrow}>Escribe los 84 municipios</span>
              <h3 id="municipalities-level-title">Elige el nivel del reto</h3>
              <p id="municipalities-level-description">
                Selecciona cómo quieres validar los nombres de los municipios.
              </p>
            </div>

            <div className={styles.levelOptions}>
              <button
                ref={levelOneButtonRef}
                type="button"
                className={styles.levelOption}
                onClick={() => handleLevelSelect(1)}
              >
                <strong>Nivel 1 · Flexible</strong>
                <span>Acepta partes del nombre y nombres sin acentos.</span>
              </button>
              <button
                type="button"
                className={styles.levelOption}
                onClick={() => handleLevelSelect(2)}
              >
                <strong>Nivel 2 · Exacto</strong>
                <span>Requiere el nombre completo, con acentos y escritura exacta.</span>
              </button>
            </div>

            <div className={styles.confirmActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setLevelDialogOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
