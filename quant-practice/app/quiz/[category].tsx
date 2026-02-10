import React, { useState, useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { questions as allQuestions } from "../../src/data/questions";
import { categories } from "../../src/data/categories";
import { QuestionCard } from "../../src/components/QuestionCard";
import { useProgress, getReviewQueue } from "../../src/hooks/useProgress";
import { useSubscription, FREE_LIMITS } from "../../src/hooks/useSubscription";
import { Category, Difficulty, QuizResult, PerQuestionResult } from "../../src/types";
import { colors, spacing, fontSize, borderRadius } from "../../src/utils/theme";

const QUIZ_SIZE = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    category: string;
    difficulty?: string;
    duration?: string;
  }>();
  const category = params.category;
  const router = useRouter();
  const { progress, saveResult } = useProgress();
  const { isPro } = useSubscription();

  const isReview = category === "review";
  const isAll = category === "all" || isReview;
  const cat = categories.find((c) => c.id === category);

  const quizQuestions = useMemo(() => {
    if (isReview) {
      const dueIds = getReviewQueue(progress.srData);
      const dueQuestions = dueIds
        .map((id) => allQuestions.find((q) => q.id === id))
        .filter(Boolean) as typeof allQuestions;
      return shuffle(dueQuestions).slice(0, QUIZ_SIZE);
    }

    let pool = isAll
      ? allQuestions
      : allQuestions.filter((q) => q.category === category);

    if (params.difficulty) {
      pool = pool.filter((q) => q.difficulty === params.difficulty);
    }
    if (params.duration) {
      pool = pool.filter((q) => q.duration === params.duration);
    }

    // Free tier: limit to first N questions per category
    if (!isPro) {
      if (isAll) {
        // For all-category mix, take first N from each category
        const limited: typeof pool = [];
        const catCounts: Record<string, number> = {};
        for (const q of pool) {
          catCounts[q.category] = (catCounts[q.category] ?? 0) + 1;
          if (catCounts[q.category] <= FREE_LIMITS.questionsPerCategory) {
            limited.push(q);
          }
        }
        pool = limited;
      } else {
        pool = pool.slice(0, FREE_LIMITS.questionsPerCategory);
      }
    }

    return shuffle(pool).slice(0, QUIZ_SIZE);
  }, [category, params.difficulty, params.duration, isAll, isReview, progress.srData, isPro]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionResults, setQuestionResults] = useState<PerQuestionResult[]>([]);

  const currentQuestion = quizQuestions[currentIndex];
  const isLast = currentIndex === quizQuestions.length - 1;

  const correctSoFar = answers.reduce<number>(
    (acc, ans, i) =>
      acc + (ans !== null && ans === quizQuestions[i]?.correctIndex ? 1 : 0),
    0
  );

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedIndex;
    setAnswers(newAnswers);
    setRevealed(true);

    // Record per-question result
    const qr: PerQuestionResult = {
      questionId: quizQuestions[currentIndex].id,
      correct: selectedIndex === quizQuestions[currentIndex].correctIndex,
      selectedIndex,
      timeMs: Date.now() - questionStartTime,
    };
    setQuestionResults((prev) => [...prev, qr]);
  }, [selectedIndex, answers, currentIndex, quizQuestions, questionStartTime]);

  const handleNext = useCallback(async () => {
    if (isLast) {
      const correctCount = answers.reduce<number>((acc, ans, i) => {
        return acc + (ans === quizQuestions[i].correctIndex ? 1 : 0);
      }, 0);

      const result: QuizResult = {
        category: isReview ? "all" : isAll ? "all" : (category as Category),
        difficulty: (params.difficulty as Difficulty) ?? "mixed",
        totalQuestions: quizQuestions.length,
        correctAnswers: correctCount,
        timeTakenMs: Date.now() - startTime,
        date: new Date().toLocaleDateString(),
        questionResults,
      };
      await saveResult(result);

      router.replace({
        pathname: "/quiz/results",
        params: {
          correct: String(correctCount),
          total: String(quizQuestions.length),
          category: category!,
          time: String(Date.now() - startTime),
        },
      });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setRevealed(false);
      setQuestionStartTime(Date.now());
    }
  }, [isLast, answers, quizQuestions, category, startTime, saveResult, router, isAll, params.difficulty, questionResults]);

  if (!currentQuestion) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>{"\u{1F50D}"}</Text>
        <Text style={styles.emptyText}>
          No questions match these filters.
        </Text>
        <Text style={styles.emptyHint}>
          Try removing a difficulty or duration filter.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const catLabel = isReview
    ? "\uD83D\uDD01 Review Queue"
    : isAll
      ? "\u26A1 Quick Mix"
      : `${cat?.icon} ${cat?.name}`;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.categoryLabel}>{catLabel}</Text>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreText}>
            {correctSoFar}/{currentIndex + (revealed ? 1 : 0)}
          </Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {quizQuestions.map((_, i) => {
          let dotColor: string = colors.border;
          if (i < currentIndex || (i === currentIndex && revealed)) {
            const ans = answers[i];
            dotColor =
              ans === quizQuestions[i].correctIndex
                ? colors.success
                : colors.error;
          } else if (i === currentIndex) {
            dotColor = colors.primary;
          }
          return (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: dotColor },
                i === currentIndex && styles.dotActive,
              ]}
            />
          );
        })}
      </View>

      <QuestionCard
        question={currentQuestion}
        selectedIndex={selectedIndex}
        revealed={revealed}
        onSelect={handleSelect}
        onSubmit={handleSubmit}
      />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {!revealed ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              selectedIndex === null && styles.buttonDisabled,
              pressed && selectedIndex !== null && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={selectedIndex === null}
          >
            <Text
              style={[
                styles.buttonText,
                selectedIndex === null && styles.buttonTextDisabled,
              ]}
            >
              Check Answer
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {isLast ? "See Results" : "Next"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.primaryLight,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  categoryLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  scoreChip: {
    backgroundColor: colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    maxWidth: 60,
  },
  dotActive: {
    height: 5,
    borderRadius: 3,
  },
  bottomBar: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  buttonTextDisabled: {
    color: colors.textDim,
  },
});
