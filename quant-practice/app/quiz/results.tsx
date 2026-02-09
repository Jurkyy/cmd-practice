import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { categories } from "../../src/data/categories";
import { colors, spacing, fontSize, borderRadius } from "../../src/utils/theme";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    correct: string;
    total: string;
    category: string;
    time: string;
  }>();

  const correct = parseInt(params.correct ?? "0", 10);
  const total = parseInt(params.total ?? "0", 10);
  const timeMs = parseInt(params.time ?? "0", 10);
  const cat = categories.find((c) => c.id === params.category);

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);

  const getMessage = () => {
    if (percentage === 100) return "Perfect score!";
    if (percentage >= 80) return "Excellent work!";
    if (percentage >= 60) return "Good job!";
    if (percentage >= 40) return "Keep practicing!";
    return "Room to improve!";
  };

  const getColor = () => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.categoryLabel}>
          {cat?.icon} {cat?.name}
        </Text>

        <Text style={[styles.percentage, { color: getColor() }]}>
          {percentage}%
        </Text>
        <Text style={styles.message}>{getMessage()}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {correct}/{total}
            </Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {minutes > 0 ? `${minutes}m ` : ""}
              {seconds}s
            </Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.retryButton}
        onPress={() =>
          router.replace({
            pathname: `/quiz/${params.category}`,
          })
        }
      >
        <Text style={styles.retryText}>Try Again</Text>
      </Pressable>

      <Pressable
        style={styles.homeButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.homeText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  categoryLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  percentage: {
    fontSize: 64,
    fontWeight: "800",
  },
  message: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  retryText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  homeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  homeText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
