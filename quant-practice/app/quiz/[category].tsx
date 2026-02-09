import React, { useState, useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { questions as allQuestions } from "../../src/data/questions";
import { categories } from "../../src/data/categories";
import { QuestionCard } from "../../src/components/QuestionCard";
import { useProgress } from "../../src/hooks/useProgress";
import { Category, QuizResult } from "../../src/types";
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
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { saveResult } = useProgress();

  const cat = categories.find((c) => c.id === category);

  const quizQuestions = useMemo(() => {
    const pool = allQuestions.filter((q) => q.category === category);
    return shuffle(pool).slice(0, QUIZ_SIZE);
  }, [category]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [startTime] = useState(Date.now());

  const currentQuestion = quizQuestions[currentIndex];
  const isLast = currentIndex === quizQuestions.length - 1;

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedIndex;
    setAnswers(newAnswers);
    setRevealed(true);
  }, [selectedIndex, answers, currentIndex]);

  const handleNext = useCallback(async () => {
    if (isLast) {
      const correctCount = answers.reduce<number>((acc, ans, i) => {
        return acc + (ans === quizQuestions[i].correctIndex ? 1 : 0);
      }, 0);

      const result: QuizResult = {
        category: category as Category,
        difficulty: "mixed",
        totalQuestions: quizQuestions.length,
        correctAnswers: correctCount,
        timeTakenMs: Date.now() - startTime,
        date: new Date().toLocaleDateString(),
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
    }
  }, [isLast, answers, quizQuestions, category, startTime, saveResult, router]);

  if (!currentQuestion) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          No questions available for this category yet.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.categoryLabel}>{cat?.icon} {cat?.name}</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {quizQuestions.length}
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${((currentIndex + (revealed ? 1 : 0)) / quizQuestions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <QuestionCard
        question={currentQuestion}
        selectedIndex={selectedIndex}
        revealed={revealed}
        onSelect={handleSelect}
      />

      <View style={styles.bottomBar}>
        {!revealed ? (
          <Pressable
            style={[
              styles.button,
              selectedIndex === null && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={selectedIndex === null}
          >
            <Text style={styles.buttonText}>Check Answer</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {isLast ? "See Results" : "Next Question"}
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
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.primary,
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
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  counter: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  bottomBar: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});
