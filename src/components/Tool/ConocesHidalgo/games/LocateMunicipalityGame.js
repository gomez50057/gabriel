"use client";

import { useState } from "react";
import municipalities from "@/data/conocesHidalgo/hidalgo-municipios.json";
import { sampleWithoutReplacement } from "@/lib/conocesHidalgo/random.mjs";
import { createGameResult, GAME_CONFIG } from "@/lib/conocesHidalgo/scoring.mjs";
import GameShell from "../GameShell";
import HidalgoMap from "../HidalgoMap";
import ResultPanel from "../ResultPanel";

const GAME_ID = "ubica-municipio";

function createRounds() {
  return sampleWithoutReplacement(municipalities, GAME_CONFIG[GAME_ID].rounds);
}

export default function LocateMunicipalityGame({ bestResult, onComplete, onExit, styles }) {
  const [rounds, setRounds] = useState(createRounds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);
  const current = rounds[roundIndex];
  const answered = Boolean(selectedId);
  const wasCorrect = selectedId === current.id;
  const score = correct * GAME_CONFIG[GAME_ID].pointsPerCorrect;

  const resetGame = () => {
    setRounds(createRounds());
    setRoundIndex(0);
    setCorrect(0);
    setIncorrect(0);
    setSelectedId("");
    setFeedback("");
    setResult(null);
  };

  const handleSelect = (municipalityId) => {
    if (answered) return;

    setSelectedId(municipalityId);

    if (municipalityId === current.id) {
      setCorrect((value) => value + 1);
      setFeedback(`Correcto. Seleccionaste ${current.officialName}.`);
    } else {
      const selected = municipalities.find((item) => item.id === municipalityId);
      setIncorrect((value) => value + 1);
      setFeedback(`Seleccionaste ${selected?.officialName}. La respuesta correcta es ${current.officialName}.`);
    }
  };

  const handleNext = () => {
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((value) => value + 1);
      setSelectedId("");
      setFeedback("");
      return;
    }

    const finalCorrect = correct;
    const finalIncorrect = incorrect;
    const nextResult = createGameResult({
      score: finalCorrect * GAME_CONFIG[GAME_ID].pointsPerCorrect,
      correct: finalCorrect,
      incorrect: finalIncorrect,
      total: rounds.length,
    });

    setResult(nextResult);
    onComplete(GAME_ID, nextResult);
  };

  if (result) {
    return <ResultPanel result={result} bestResult={bestResult} onReplay={resetGame} onBack={onExit} styles={styles} />;
  }

  return (
    <GameShell
      eyebrow="Ubicación territorial"
      title="¿Dónde está este municipio?"
      description="Selecciona en el mapa el polígono del municipio indicado."
      current={roundIndex + 1}
      total={rounds.length}
      score={score}
      feedback={feedback}
      onExit={onExit}
      styles={styles}
    >
      <div className={styles.gameWorkspace}>
        <div className={styles.questionPanel}>
          <span className={styles.questionLabel}>Encuentra en el mapa</span>
          <h3>¿Dónde está {current.officialName}?</h3>
          <p>Haz clic, toca el polígono o selecciónalo con el teclado.</p>
          {answered && (
            <button type="button" className={styles.primaryButton} onClick={handleNext}>
              {roundIndex === rounds.length - 1 ? "Ver resultado" : "Siguiente pregunta"}
            </button>
          )}
        </div>

        <HidalgoMap
          interactive={!answered}
          correctId={answered ? current.id : ""}
          incorrectId={answered && !wasCorrect ? selectedId : ""}
          onSelect={handleSelect}
          styles={styles}
        />
      </div>
    </GameShell>
  );
}
