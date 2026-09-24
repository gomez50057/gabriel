export const STORAGE_KEY = "conocesHidalgo:v1";

export const emptyProgress = {
  version: 1,
  updatedAt: null,
  games: {},
};

export function parseProgress(value) {
  if (!value) return emptyProgress;

  try {
    const parsed = JSON.parse(value);

    if (parsed?.version !== 1 || typeof parsed.games !== "object") {
      return emptyProgress;
    }

    return {
      version: 1,
      updatedAt: parsed.updatedAt || null,
      games: parsed.games || {},
    };
  } catch {
    return emptyProgress;
  }
}

export function readProgress() {
  if (typeof window === "undefined") return emptyProgress;
  return parseProgress(window.localStorage.getItem(STORAGE_KEY));
}

export function writeGameResult(progress, gameId, result) {
  const previous = progress.games[gameId] || {};
  const isBest = result.score > (previous.bestScore ?? -1);
  const nextGame = {
    bestScore: isBest ? result.score : previous.bestScore ?? result.score,
    bestCorrect: isBest ? result.correct : previous.bestCorrect ?? result.correct,
    bestPercentage: isBest ? result.percentage : previous.bestPercentage ?? result.percentage,
    recognition: isBest ? result.recognition : previous.recognition ?? result.recognition,
    plays: (previous.plays || 0) + 1,
  };

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    games: {
      ...progress.games,
      [gameId]: nextGame,
    },
  };
}

export function persistProgress(progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
