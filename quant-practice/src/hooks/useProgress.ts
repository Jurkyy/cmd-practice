import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserProgress,
  QuizResult,
  Category,
  Difficulty,
  QuestionSRData,
  ACHIEVEMENTS,
} from "../types";
import { questions as allQuestions } from "../data/questions";

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

const defaultDifficultyStats = (): Record<
  Difficulty,
  { attempted: number; correct: number }
> => ({
  easy: { attempted: 0, correct: 0 },
  medium: { attempted: 0, correct: 0 },
  hard: { attempted: 0, correct: 0 },
});

const defaultProgress: UserProgress = {
  totalAttempted: 0,
  totalCorrect: 0,
  categoryStats: defaultCategoryStats(),
  tagStats: {},
  difficultyStats: defaultDifficultyStats(),
  history: [],
  srData: {},
  streak: { current: 0, longest: 0, lastPracticeDate: "" },
  achievements: [],
};

// ─── SM-2 Algorithm ──────────────────────────────────────────────

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function updateSR(
  existing: QuestionSRData | undefined,
  correct: boolean,
  questionId: string
): QuestionSRData {
  const today = getToday();

  if (!existing) {
    return {
      questionId,
      easeFactor: 2.5,
      interval: correct ? 1 : 0,
      repetitions: correct ? 1 : 0,
      nextReviewDate: correct ? addDays(today, 1) : today,
      lastAttemptDate: today,
      totalAttempts: 1,
      totalCorrect: correct ? 1 : 0,
    };
  }

  let { easeFactor, interval, repetitions } = existing;

  if (correct) {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    easeFactor = Math.max(1.3, easeFactor + 0.1);
  } else {
    repetitions = 0;
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  return {
    questionId,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: interval > 0 ? addDays(today, interval) : today,
    lastAttemptDate: today,
    totalAttempts: existing.totalAttempts + 1,
    totalCorrect: existing.totalCorrect + (correct ? 1 : 0),
  };
}

// ─── Streak logic ────────────────────────────────────────────────

function updateStreak(
  streak: UserProgress["streak"]
): UserProgress["streak"] {
  const today = getToday();
  const yesterday = addDays(today, -1);

  if (streak.lastPracticeDate === today) {
    return streak;
  }

  if (streak.lastPracticeDate === yesterday) {
    const newCurrent = streak.current + 1;
    return {
      current: newCurrent,
      longest: Math.max(streak.longest, newCurrent),
      lastPracticeDate: today,
    };
  }

  return {
    current: 1,
    longest: Math.max(streak.longest, 1),
    lastPracticeDate: today,
  };
}

// ─── Review queue helpers ────────────────────────────────────────

export function getReviewQueue(
  srData: Record<string, QuestionSRData>
): string[] {
  const today = getToday();
  return Object.values(srData)
    .filter((sr) => sr.nextReviewDate <= today)
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
    .map((sr) => sr.questionId);
}

export function getWeakTags(
  tagStats: Record<string, { attempted: number; correct: number }>,
  minAttempts: number = 3
): { tag: string; accuracy: number }[] {
  return Object.entries(tagStats)
    .filter(([, stats]) => stats.attempted >= minAttempts)
    .map(([tag, stats]) => ({
      tag,
      accuracy: Math.round((stats.correct / stats.attempted) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);
}

// ─── Hook ────────────────────────────────────────────────────────

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [loaded, setLoaded] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as UserProgress;
          const merged: UserProgress = {
            ...defaultProgress,
            ...parsed,
            categoryStats: {
              ...defaultCategoryStats(),
              ...parsed.categoryStats,
            },
            difficultyStats: {
              ...defaultDifficultyStats(),
              ...(parsed.difficultyStats ?? {}),
            },
            tagStats: parsed.tagStats ?? {},
            srData: parsed.srData ?? {},
            streak: parsed.streak ?? defaultProgress.streak,
            achievements: parsed.achievements ?? [],
          };
          setProgress(merged);
        } catch {
          setProgress(defaultProgress);
        }
      }
      setLoaded(true);
    });
  }, []);

  const checkAchievements = useCallback(
    (updated: UserProgress): string[] => {
      const newlyEarned: string[] = [];
      for (const ach of ACHIEVEMENTS) {
        if (
          !updated.achievements.includes(ach.id) &&
          ach.condition(updated)
        ) {
          newlyEarned.push(ach.id);
        }
      }
      return newlyEarned;
    },
    []
  );

  const saveResult = useCallback(
    async (result: QuizResult) => {
      const p = progressRef.current;

      const newTagStats = { ...p.tagStats };
      const newSRData = { ...p.srData };
      const newDiffStats = {
        easy: { ...p.difficultyStats.easy },
        medium: { ...p.difficultyStats.medium },
        hard: { ...p.difficultyStats.hard },
      };

      // Process per-question results for SR, tags, difficulty
      if (result.questionResults) {
        for (const qr of result.questionResults) {
          const question = allQuestions.find((q) => q.id === qr.questionId);
          if (!question) continue;

          // SR update
          newSRData[qr.questionId] = updateSR(
            newSRData[qr.questionId],
            qr.correct,
            qr.questionId
          );

          // Tag stats
          for (const tag of question.tags) {
            if (!newTagStats[tag]) {
              newTagStats[tag] = { attempted: 0, correct: 0 };
            }
            newTagStats[tag].attempted += 1;
            if (qr.correct) newTagStats[tag].correct += 1;
          }

          // Difficulty stats
          newDiffStats[question.difficulty].attempted += 1;
          if (qr.correct) newDiffStats[question.difficulty].correct += 1;
        }
      }

      const newStreak = updateStreak(p.streak);

      const updated: UserProgress = {
        totalAttempted: p.totalAttempted + result.totalQuestions,
        totalCorrect: p.totalCorrect + result.correctAnswers,
        categoryStats: {
          ...p.categoryStats,
          ...(result.category !== "all" && {
            [result.category]: {
              attempted:
                (p.categoryStats[result.category]?.attempted ?? 0) +
                result.totalQuestions,
              correct:
                (p.categoryStats[result.category]?.correct ?? 0) +
                result.correctAnswers,
            },
          }),
        },
        tagStats: newTagStats,
        difficultyStats: newDiffStats,
        history: [result, ...p.history].slice(0, 50),
        srData: newSRData,
        streak: newStreak,
        achievements: p.achievements,
      };

      // Check achievements
      const earned = checkAchievements(updated);
      if (earned.length > 0) {
        updated.achievements = [...updated.achievements, ...earned];
        setNewAchievements(earned);
      }

      setProgress(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [checkAchievements]
  );

  const dismissAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const resetProgress = useCallback(async () => {
    setProgress(defaultProgress);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    loaded,
    saveResult,
    resetProgress,
    newAchievements,
    dismissAchievements,
  };
}
