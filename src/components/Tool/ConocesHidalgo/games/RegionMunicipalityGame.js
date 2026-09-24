"use client";

import { useMemo, useState } from "react";
import municipalities from "@/data/conocesHidalgo/hidalgo-municipios.json";
import regions from "@/data/conocesHidalgo/hidalgo-regiones.json";
import { sampleWithoutReplacement, shuffle } from "@/lib/conocesHidalgo/random.mjs";
import { createGameResult, GAME_CONFIG } from "@/lib/conocesHidalgo/scoring.mjs";
import GameShell from "../GameShell";
import ResultPanel from "../ResultPanel";

const GAME_ID = "region-municipio";

function createRounds() {
  return sampleWithoutReplacement(municipalities, GAME_CONFIG[GAME_ID].rounds);
}

export default function RegionMunicipalityGame({ bestResult, onComplete, onExit, styles }) {
  const [rounds, setRounds] = useState(createRounds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);
  const current = rounds[roundIndex];
  const answered = Boolean(selectedId);
  const options = useMemo(() => {
    const correctRegion = regions.find((region) => region.id === current.regionId);
    const distractors = sampleWithoutReplacement(
      regions.filter((region) => region.id !== current.regionId),
      3
    );
    return shuffle([correctRegion, ...distractors]);
  }, [current]);
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

  const handleAnswer = (region) => {
    if (answered) return;
    setSelectedId(region.id);

    if (region.id === current.regionId) {
      setCorrect((value) => value + 1);
      setFeedback(`Correcto. ${current.officialName} pertenece a la región ${current.regionName}.`);
    } else {
      setIncorrect((value) => value + 1);
      setFeedback(`La respuesta correcta es la región ${current.regionName}.`);
    }
  };

  const handleNext = () => {
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((value) => value + 1);
      setSelectedId("");
      setFeedback("");
      return;
    }

    const nextResult = createGameResult({ score, correct, incorrect, total: rounds.length });
    setResult(nextResult);
    onComplete(GAME_ID, nextResult);
  };

  if (result) {
    return <ResultPanel result={result} bestResult={bestResult} onReplay={resetGame} onBack={onExit} styles={styles} />;
  }

  return (
    <GameShell
      eyebrow="Regionalización estatal"
      title="¿De qué región es?"
      description="Relaciona cada municipio con la región administrativa registrada en el catálogo del proyecto."
      current={roundIndex + 1}
      total={rounds.length}
      score={score}
      feedback={feedback}
      onExit={onExit}
      styles={styles}
    >
      <div className={styles.centeredGame}>
        <span className={styles.questionLabel}>Municipio</span>
        <h3>{current.officialName}</h3>
        <p>¿A qué región pertenece?</p>

        <div className={styles.regionOptions}>
          {options.map((region) => {
            const isCorrect = answered && region.id === current.regionId;
            const isIncorrect = answered && region.id === selectedId && selectedId !== current.regionId;
            return (
              <button
                key={region.id}
                type="button"
                className={`${styles.optionButton} ${isCorrect ? styles.optionCorrect : ""} ${isIncorrect ? styles.optionIncorrect : ""}`}
                disabled={answered}
                onClick={() => handleAnswer(region)}
              >
                {region.label}
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
    </GameShell>
  );
}
