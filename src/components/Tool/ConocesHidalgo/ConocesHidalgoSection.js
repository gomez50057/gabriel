"use client";

import { useEffect, useMemo, useState } from "react";
import useLocalGameProgress from "@/hooks/useLocalGameProgress";
import GameSelector from "./GameSelector";
import HidalgoHero from "./HidalgoHero";
import GuessMunicipalityGame from "./games/GuessMunicipalityGame";
import IdentifyMunicipalityGame from "./games/IdentifyMunicipalityGame";
import LocateMunicipalityGame from "./games/LocateMunicipalityGame";
import MunicipalitiesWrittenGame from "./games/MunicipalitiesWrittenGame";
import RegionMunicipalityGame from "./games/RegionMunicipalityGame";
import styles from "./ConocesHidalgo.module.css";

const GAMES = [
  {
    id: "municipios-escritos",
    title: "Escribe los 84 municipios",
    description: "Recuerda tantos municipios como puedas y observa cómo se ilumina el mapa.",
    duration: "84 municipios",
  },
  {
    id: "ubica-municipio",
    title: "¿Dónde está este municipio?",
    description: "Lee el nombre y selecciona su ubicación directamente en el mapa.",
    duration: "10 preguntas",
  },
  {
    id: "identifica-municipio",
    title: "¿Qué municipio es?",
    description: "Identifica el polígono resaltado entre cuatro opciones posibles.",
    duration: "10 preguntas",
  },
  {
    id: "region-municipio",
    title: "¿De qué región es?",
    description: "Relaciona cada municipio con su región dentro del catálogo estatal.",
    duration: "10 preguntas",
  },
  {
    id: "adivina-municipio",
    title: "¿Qué municipio soy?",
    description: "Usa pistas progresivas; entre menos necesites, más puntos obtienes.",
    duration: "5 municipios",
  },
];

const GAME_COMPONENTS = {
  "municipios-escritos": MunicipalitiesWrittenGame,
  "ubica-municipio": LocateMunicipalityGame,
  "identifica-municipio": IdentifyMunicipalityGame,
  "region-municipio": RegionMunicipalityGame,
  "adivina-municipio": GuessMunicipalityGame,
};

export default function ConocesHidalgoSection() {
  const [activeGameId, setActiveGameId] = useState("");
  const [writtenLevel, setWrittenLevel] = useState(null);
  const { progress, hydrated, saveResult, resetProgress } = useLocalGameProgress();
  const ActiveGame = GAME_COMPONENTS[activeGameId];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeGameId]);
  const summary = useMemo(() => {
    const gameResults = Object.values(progress.games);
    return {
      played: gameResults.length,
      plays: gameResults.reduce((total, game) => total + (game.plays || 0), 0),
      points: gameResults.reduce((total, game) => total + (game.bestScore || 0), 0),
      recognitions: new Set(gameResults.map((game) => game.recognition).filter(Boolean)).size,
    };
  }, [progress]);

  const handleComplete = (gameId, result) => {
    saveResult(gameId, result);
  };

  const handleGameSelect = (gameId, level) => {
    setWrittenLevel(gameId === "municipios-escritos" ? level : null);
    setActiveGameId(gameId);
  };

  const handleGameExit = () => {
    setWrittenLevel(null);
    setActiveGameId("");
  };

  if (ActiveGame) {
    return (
      <section className={styles.wrapper}>
          <ActiveGame
            bestResult={progress.games[activeGameId]}
            onComplete={handleComplete}
            onExit={handleGameExit}
            level={activeGameId === "municipios-escritos" ? writtenLevel : undefined}
            styles={styles}
          />
      </section>
    );
  }

  return (
    <>
      <HidalgoHero />
      <section className={styles.wrapper}>

      <section className={styles.localSummary} aria-label="Resumen del progreso guardado">
        <div>
          <span>Retos jugados</span>
          <strong>{hydrated ? summary.played : "–"} / {GAMES.length}</strong>
        </div>
        <div>
          <span>Partidas terminadas</span>
          <strong>{hydrated ? summary.plays : "–"}</strong>
        </div>
        <div>
          <span>Mejores puntos</span>
          <strong>{hydrated ? summary.points.toLocaleString("es-MX") : "–"}</strong>
        </div>
        <div>
          <span>Reconocimientos</span>
          <strong>{hydrated ? summary.recognitions : "–"}</strong>
        </div>
      </section>

      <footer className={styles.privacyNote}>
        <div>
          <strong>Tu progreso permanece en este navegador</strong>
          <p>No se solicita una cuenta ni se envían tus resultados personales a un servidor.</p>
        </div>
        {summary.plays > 0 && (
          <button type="button" className={styles.textButton} onClick={resetProgress}>
            Borrar progreso local
          </button>
        )}
      </footer>

      <GameSelector games={GAMES} progress={progress} onSelect={handleGameSelect} styles={styles} />
      </section>
    </>
  );
}
