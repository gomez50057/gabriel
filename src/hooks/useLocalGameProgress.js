"use client";

import { useEffect, useState } from "react";
import {
  clearProgress,
  emptyProgress,
  persistProgress,
  readProgress,
  writeGameResult,
} from "@/lib/conocesHidalgo/storage";

export default function useLocalGameProgress() {
  const [progress, setProgress] = useState(emptyProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(readProgress());
    setHydrated(true);
  }, []);

  const saveResult = (gameId, result) => {
    setProgress((current) => {
      const next = writeGameResult(current, gameId, result);
      persistProgress(next);
      return next;
    });
  };

  const resetProgress = () => {
    clearProgress();
    setProgress(emptyProgress);
  };

  return { progress, hydrated, saveResult, resetProgress };
}
