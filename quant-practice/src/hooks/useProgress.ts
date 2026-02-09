import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProgress, QuizResult, Category } from "../types";

const STORAGE_KEY = "quant-practice-progress";

const defaultCategoryStats = (): Record<
  Category,
  { attempted: number; correct: number }
> => ({
  probability: { attempted: 0, correct: 0 },
  statistics: { attempted: 0, correct: 0 },
  "stochastic-calculus": { attempted: 0, correct: 0 },
  "options-pricing": { attempted: 0, correct: 0 },
  "brain-teasers": { attempted: 0, correct: 0 },
  "linear-algebra": { attempted: 0, correct: 0 },
});

const defaultProgress: UserProgress = {
  totalAttempted: 0,
  totalCorrect: 0,
  categoryStats: defaultCategoryStats(),
  history: [],
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as UserProgress;
          // Ensure all category keys exist (forward compat)
          const merged = {
            ...defaultProgress,
            ...parsed,
            categoryStats: {
              ...defaultCategoryStats(),
              ...parsed.categoryStats,
            },
          };
          setProgress(merged);
        } catch {
          setProgress(defaultProgress);
        }
      }
      setLoaded(true);
    });
  }, []);

  const saveResult = useCallback(
    async (result: QuizResult) => {
      const updated: UserProgress = {
        totalAttempted: progress.totalAttempted + result.totalQuestions,
        totalCorrect: progress.totalCorrect + result.correctAnswers,
        categoryStats: {
          ...progress.categoryStats,
          ...(result.category !== "all" && {
            [result.category]: {
              attempted:
                (progress.categoryStats[result.category]?.attempted ?? 0) +
                result.totalQuestions,
              correct:
                (progress.categoryStats[result.category]?.correct ?? 0) +
                result.correctAnswers,
            },
          }),
        },
        history: [result, ...progress.history].slice(0, 50),
      };
      setProgress(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [progress]
  );

  const resetProgress = useCallback(async () => {
    setProgress(defaultProgress);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { progress, loaded, saveResult, resetProgress };
}
