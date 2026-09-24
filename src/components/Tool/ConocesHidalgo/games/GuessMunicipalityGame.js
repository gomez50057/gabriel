"use client";

import { useMemo, useState } from "react";
import municipalities from "@/data/conocesHidalgo/hidalgo-municipios.json";
import clueGroups from "@/data/conocesHidalgo/hidalgo-pistas.json";
import { sampleWithoutReplacement } from "@/lib/conocesHidalgo/random.mjs";
import { createGameResult, GAME_CONFIG, getGuessPoints } from "@/lib/conocesHidalgo/scoring.mjs";
import GameShell from "../GameShell";
import ResultPanel from "../ResultPanel";

const GAME_ID = "adivina-municipio";
const cluesByMunicipality = new Map(clueGroups.map((item) => [item.municipalityId, item.clues]));

function createRounds() {
  return sampleWithoutReplacement(municipalities, GAME_CONFIG[GAME_ID].rounds);
}

export default function GuessMunicipalityGame({ bestResult, onComplete, onExit, styles }) {
  const [rounds, setRounds] = useState(createRounds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [answerId, setAnswerId] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);
  const current = rounds[roundIndex];
  const clues = useMemo(
    () => cluesByMunicipality.get(current.id) || [],
    [current.id]
  );
  const visibleClues = useMemo(() => clues.slice(0, clueIndex + 1), [clues, clueIndex]);

  const resetGame = () => {
    setRounds(createRounds());
    setRoundIndex(0);
    setClueIndex(0);
    setAnswerId("");
    setAnswered(false);
    setCorrect(0);
    setIncorrect(0);
    setScore(0);
    setFeedback("");
    setResult(null);
  };

  const handleAnswer = () => {
    if (!answerId || answered) {
      if (!answerId) setFeedback("Selecciona un municipio antes de responder.");
      return;
    }

    setAnswered(true);

    if (answerId === current.id) {
      const earnedPoints = getGuessPoints(clueIndex + 1);
      setCorrect((value) => value + 1);
      setScore((value) => value + earnedPoints);
      setFeedback(`Correcto: era ${current.officialName}. Sumaste ${earnedPoints} puntos.`);
    } else {
      setIncorrect((value) => value + 1);
      setFeedback(`Era ${current.officialName}. Puedes intentarlo con otro municipio en la siguiente ronda.`);
    }
  };

  const handleNext = () => {
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((value) => value + 1);
      setClueIndex(0);
      setAnswerId("");
      setAnswered(false);
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
      eyebrow="Pistas progresivas"
      title="¿Qué municipio soy?"
      description="Adivina el municipio con el menor número de pistas posible."
      current={roundIndex + 1}
      total={rounds.length}
      score={score}
      feedback={feedback}
      onExit={onExit}
      styles={styles}
    >
      <div className={styles.centeredGame}>
        <span className={styles.questionLabel}>Pistas disponibles</span>
        <ol className={styles.clueList}>
          {visibleClues.map((clue) => <li key={clue}>{clue}</li>)}
        </ol>

        {!answered && clueIndex < clues.length - 1 && (
          <button type="button" className={styles.textButton} onClick={() => setClueIndex((value) => value + 1)}>
            Ver otra pista
          </button>
        )}

        <div className={styles.guessControls}>
          <div className={styles.formGroup}>
            <label htmlFor="guess-municipality">Selecciona un municipio</label>
            <select
              id="guess-municipality"
              value={answerId}
              disabled={answered}
              onChange={(event) => setAnswerId(event.target.value)}
            >
              <option value="">Elige una opción</option>
              {municipalities.map((municipality) => (
                <option key={municipality.id} value={municipality.id}>{municipality.officialName}</option>
              ))}
            </select>
          </div>

          {!answered ? (
            <button type="button" className={styles.primaryButton} onClick={handleAnswer}>Responder</button>
          ) : (
            <button type="button" className={styles.primaryButton} onClick={handleNext}>
              {roundIndex === rounds.length - 1 ? "Ver resultado" : "Siguiente municipio"}
            </button>
          )}
        </div>
      </div>
    </GameShell>
  );
}
