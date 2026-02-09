import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { categories } from "../../src/data/categories";
import { questions } from "../../src/data/questions";
import { CategoryCard } from "../../src/components/CategoryCard";
import { FilterBar } from "../../src/components/FilterBar";
import { useProgress } from "../../src/hooks/useProgress";
import { Difficulty, Duration } from "../../src/types";
import { colors, spacing, fontSize, borderRadius, shadow } from "../../src/utils/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { progress, loaded } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);

  const filteredCount = useMemo(() => {
    return questions.filter(
      (q) =>
        (!difficulty || q.difficulty === difficulty) &&
        (!duration || q.duration === duration)
    ).length;
  }, [difficulty, duration]);

  const filteredCategoryCount = (catId: string) =>
    questions.filter(
      (q) =>
        q.category === catId &&
        (!difficulty || q.difficulty === difficulty) &&
        (!duration || q.duration === duration)
    ).length;

  const overallAcc =
    loaded && progress.totalAttempted > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>QUANT</Text>
        <Text style={styles.heroTitle}>Practice</Text>
        <Text style={styles.heroSub}>
          {questions.length} questions across {categories.length} topics
        </Text>
      </View>

      {/* Quick stats */}
      {loaded && progress.totalAttempted > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{progress.totalAttempted}</Text>
            <Text style={styles.statLabel}>Attempted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{progress.totalCorrect}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {overallAcc}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      )}

      {/* Quick Mix button */}
      <Pressable
        style={({ pressed }) => [
          styles.mixButton,
          pressed && styles.mixPressed,
        ]}
        onPress={() =>
          router.push({
            pathname: "/quiz/[category]",
            params: {
              category: "all",
              ...(difficulty ? { difficulty } : {}),
              ...(duration ? { duration } : {}),
            },
          })
        }
      >
        <Text style={styles.mixIcon}>{"\u26A1"}</Text>
        <View style={styles.mixText}>
          <Text style={styles.mixTitle}>Quick Mix</Text>
          <Text style={styles.mixSub}>Random questions from all categories</Text>
        </View>
        <View style={styles.mixGo}>
          <Text style={styles.mixGoText}>Go</Text>
        </View>
      </Pressable>

      {/* Filters */}
      <FilterBar
        selectedDifficulty={difficulty}
        selectedDuration={duration}
        onDifficultyChange={setDifficulty}
        onDurationChange={setDuration}
        questionCount={filteredCount}
      />

      {/* Category cards */}
      <Text style={styles.sectionTitle}>TOPICS</Text>

      {categories
        .filter((cat) => filteredCategoryCount(cat.id) > 0)
        .map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            stats={progress.categoryStats[cat.id]}
            onPress={() =>
              router.push({
                pathname: "/quiz/[category]",
                params: {
                  category: cat.id,
                  ...(difficulty ? { difficulty } : {}),
                  ...(duration ? { duration } : {}),
                },
              })
            }
          />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl + 20,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroLabel: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 4,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  heroSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  mixButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
  },
  mixPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  mixIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  mixText: {
    flex: 1,
  },
  mixTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  mixSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  mixGo: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  mixGoText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
});
