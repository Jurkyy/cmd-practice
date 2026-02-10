import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MentalMathStats, MentalMathResult, MathDifficulty } from "../types";

const STORAGE_KEY = "quant-practice-mental-math";

const DEFAULT_STATS: MentalMathStats = {
  totalSessions: 0,
  totalCorrect: 0,
  totalAttempted: 0,
  bestScore: { easy: 0, medium: 0, hard: 0 },
  history: [],
};

export function useMentalMath() {
  const [stats, setStats] = useState<MentalMathStats>(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setStats({
            totalSessions: parsed.totalSessions ?? 0,
            totalCorrect: parsed.totalCorrect ?? 0,
            totalAttempted: parsed.totalAttempted ?? 0,
            bestScore: {
              easy: parsed.bestScore?.easy ?? 0,
              medium: parsed.bestScore?.medium ?? 0,
              hard: parsed.bestScore?.hard ?? 0,
            },
            history: parsed.history ?? [],
          });
        }
      } catch {
        // ignore
      }
      setLoaded(true);
    })();
  }, []);

  const saveDrillResult = useCallback(
    async (result: MentalMathResult) => {
      const updated: MentalMathStats = {
        totalSessions: stats.totalSessions + 1,
        totalCorrect: stats.totalCorrect + result.correct,
        totalAttempted: stats.totalAttempted + result.attempted,
        bestScore: {
          ...stats.bestScore,
          [result.difficulty]: Math.max(
            stats.bestScore[result.difficulty as MathDifficulty] ?? 0,
            result.correct
          ),
        },
        history: [result, ...stats.history].slice(0, 20),
      };
      setStats(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [stats]
  );

  const resetMathStats = useCallback(async () => {
    setStats(DEFAULT_STATS);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { stats, loaded, saveDrillResult, resetMathStats };
}
