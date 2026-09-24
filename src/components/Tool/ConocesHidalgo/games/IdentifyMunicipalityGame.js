"use client";

import { useMemo, useState } from "react";
import municipalities from "@/data/conocesHidalgo/hidalgo-municipios.json";
import { getMultipleChoiceOptions, sampleWithoutReplacement } from "@/lib/conocesHidalgo/random.mjs";
import { createGameResult, GAME_CONFIG } from "@/lib/conocesHidalgo/scoring.mjs";
import GameShell from "../GameShell";
import HidalgoMap from "../HidalgoMap";
import ResultPanel from "../ResultPanel";

const GAME_ID = "identifica-municipio";

function createRounds() {
  return sampleWithoutReplacement(municipalities, GAME_CONFIG[GAME_ID].rounds);
}

export default function IdentifyMunicipalityGame({ bestResult, onComplete, onExit, styles }) {
  const [rounds, setRounds] = useState(createRounds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);
  const current = rounds[roundIndex];
  const answered = Boolean(selectedId);
  const options = useMemo(
    () => getMultipleChoiceOptions({ correct: current, items: municipalities, count: 4, getGroup: (item) => item.regionId }),
    [current]
  );
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

  const handleAnswer = (municipality) => {
    if (answered) return;
    setSelectedId(municipality.id);

    if (municipality.id === current.id) {
      setCorrect((value) => value + 1);
      setFeedback(`Correcto: el municipio es ${current.officialName}.`);
    } else {
      setIncorrect((value) => value + 1);
      setFeedback(`La respuesta correcta es ${current.officialName}.`);
    }
  };

  const handleNext = () => {
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((value) => value + 1);
      setSelectedId("");
      setFeedback("");
      return;
    }

    const nextResult = createGameResult({
      score,
      correct,
      incorrect,
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
      eyebrow="Lectura del mapa"
      title="¿Qué municipio es?"
      description="Identifica el municipio iluminado y elige su nombre oficial."
      current={roundIndex + 1}
      total={rounds.length}
      score={score}
      feedback={feedback}
      onExit={onExit}
      styles={styles}
    >
      <div className={styles.gameWorkspace}>
        <div className={styles.questionPanel}>
          <span className={styles.questionLabel}>Municipio resaltado</span>
          <h3>¿Qué municipio es?</h3>
          <div className={styles.optionGrid}>
            {options.map((option) => {
              const isCorrect = answered && option.id === current.id;
              const isIncorrect = answered && option.id === selectedId && selectedId !== current.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.optionButton} ${isCorrect ? styles.optionCorrect : ""} ${isIncorrect ? styles.optionIncorrect : ""}`}
                  disabled={answered}
                  onClick={() => handleAnswer(option)}
                >
                  {option.officialName}
                </button>
              );
            })}
          </div>
          {answered && (
            <button type="button" className={styles.primaryButton} onClick={handleNext}>
              {roundIndex === rounds.length - 1 ? "Ver resultado" : "Siguiente pregunta"}
            </button>
          )}
        </div>

        <HidalgoMap targetId={current.id} styles={styles} />
      </div>
    </GameShell>
  );
}
