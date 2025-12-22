const safeJsonParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const loadBoardState = (storageKey, legacyKeys = []) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return safeJsonParse(raw);

    for (const k of legacyKeys) {
      const legacyRaw = localStorage.getItem(k);
      if (legacyRaw) {
        const parsed = safeJsonParse(legacyRaw);
        localStorage.removeItem(k);
        return parsed;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const saveBoardState = (storageKey, state) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // ignore
  }
};

export const clearBoardState = (storageKey, legacyKeys = []) => {
  try {
    localStorage.removeItem(storageKey);
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};
