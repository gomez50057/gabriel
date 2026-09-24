"use client";

import { useMemo, useState } from "react";
import municipalities from "@/data/conocesHidalgo/hidalgo-municipios.json";
import { findMunicipality } from "@/lib/conocesHidalgo/normalizeMunicipality.mjs";
import { createGameResult, GAME_CONFIG } from "@/lib/conocesHidalgo/scoring.mjs";
import GameShell from "../GameShell";
import HidalgoMap from "../HidalgoMap";
import ResultPanel from "../ResultPanel";

const GAME_ID = "municipios-escritos";

export default function MunicipalitiesWrittenGame({ bestResult, onComplete, onExit, styles, level = 1 }) {
  const [input, setInput] = useState("");
  const [foundIds, setFoundIds] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);
  const levelDescription = level === 2
    ? "Nivel 2: escribe el nombre oficial completo, con acentos y escritura exacta."
    : "Nivel 1: acepta partes del nombre y nombres sin acentos.";
  const foundSet = useMemo(() => new Set(foundIds), [foundIds]);
  const foundMunicipalities = useMemo(
    () => municipalities.filter((item) => foundSet.has(item.id)),
    [foundSet]
  );
  const missingMunicipalities = useMemo(
    () => municipalities.filter((item) => !foundSet.has(item.id)),
    [foundSet]
  );
  const score = foundIds.length * GAME_CONFIG[GAME_ID].pointsPerCorrect;

  const resetGame = () => {
    setInput("");
    setFoundIds([]);
    setFeedback("");
    setResult(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!input.trim()) {
      setFeedback("Escribe el nombre de un municipio.");
      return;
    }

    const municipality = findMunicipality(input, municipalities, level);

    if (!municipality) {
      setFeedback(
        level === 2
          ? "Escribe el nombre oficial completo, con acentos y escritura exacta."
          : "No encontramos un municipio único con esa parte del nombre. Revisa la escritura e intenta nuevamente."
      );
      return;
    }

    if (foundSet.has(municipality.id)) {
      setFeedback(`Ya habías agregado ${municipality.officialName}.`);
      setInput("");
      return;
    }

    setFoundIds((current) => [...current, municipality.id]);
    setFeedback(`Correcto: ${municipality.officialName}.`);
    setInput("");
  };

  const finishGame = () => {
    const nextResult = createGameResult({
      score,
      correct: foundIds.length,
      incorrect: municipalities.length - foundIds.length,
      total: municipalities.length,
      details: (
        <div className={styles.answerColumns}>
          <div>
            <h3>Municipios recordados</h3>
            <p>{foundMunicipalities.map((item) => item.officialName).join(", ") || "Ninguno todavía."}</p>
          </div>
          <div>
            <h3>Municipios faltantes</h3>
            <p>{missingMunicipalities.map((item) => item.officialName).join(", ")}</p>
          </div>
        </div>
      ),
    });

    setResult(nextResult);
    onComplete(GAME_ID, nextResult);
  };

  if (result) {
    return <ResultPanel result={result} bestResult={bestResult} onReplay={resetGame} onBack={onExit} styles={styles} />;
  }

  return (
    <GameShell
      eyebrow="Memoria municipal"
      title="Escribe los 84 municipios"
      description={
        level === 2
          ? "Agrega los municipios que recuerdes con el nombre oficial completo, acentos y escritura exacta."
          : "Agrega los municipios que recuerdes. Se aceptan partes del nombre y se ignoran acentos."
      }
      current={foundIds.length}
      total={municipalities.length}
      score={score}
      feedback={feedback}
      onExit={onExit}
      styles={styles}
    >
      <div className={styles.gameWorkspace}>
        <div className={styles.questionPanel}>
          <p className={styles.levelNote}>{levelDescription}</p>
          <form className={styles.answerForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="municipality-answer">Nombre del municipio</label>
              <input
                id="municipality-answer"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ej. Pachuca"
                autoComplete="off"
                autoFocus
              />
            </div>
            <button type="submit" className={styles.primaryButton}>Agregar</button>
          </form>

          <div className={styles.foundList}>
            <h3>{foundIds.length} de 84 municipios</h3>
            {foundMunicipalities.length ? (
              <ul>
                {foundMunicipalities.map((municipality) => <li key={municipality.id}>{municipality.officialName}</li>)}
              </ul>
            ) : (
              <p>Los municipios correctos aparecerán aquí.</p>
            )}
          </div>

          <button type="button" className={styles.secondaryButton} onClick={finishGame}>
            Terminar reto
          </button>
        </div>

        <HidalgoMap discoveredIds={foundSet} styles={styles} />
      </div>
    </GameShell>
  );
}
