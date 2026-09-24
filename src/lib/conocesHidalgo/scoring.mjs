export const GAME_CONFIG = {
  "municipios-escritos": { pointsPerCorrect: 10, total: 84 },
  "ubica-municipio": { pointsPerCorrect: 100, rounds: 10 },
  "identifica-municipio": { pointsPerCorrect: 100, rounds: 10 },
  "region-municipio": { pointsPerCorrect: 100, rounds: 10 },
  "adivina-municipio": { hintPoints: [300, 200, 100, 100], rounds: 5 },
};

export function getRecognition(percentage) {
  if (percentage >= 90) return "Experto en Hidalgo";
  if (percentage >= 75) return "Gran conocedor del territorio";
  if (percentage >= 50) return "Conocedor de Hidalgo";
  if (percentage >= 25) return "Caminante hidalguense";
  return "Explorador de Hidalgo";
}

export function getPerformancePercentage(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function createGameResult({ score, correct, incorrect, total, details = null }) {
  const percentage = getPerformancePercentage(correct, total);

  return {
    score,
    correct,
    incorrect,
    total,
    percentage,
    recognition: getRecognition(percentage),
    details,
  };
}

export function getGuessPoints(cluesUsed) {
  const points = GAME_CONFIG["adivina-municipio"].hintPoints;
  return points[Math.min(Math.max(cluesUsed - 1, 0), points.length - 1)];
}
