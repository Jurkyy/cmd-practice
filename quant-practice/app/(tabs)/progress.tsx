import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { categories } from "../../src/data/categories";
import { useProgress } from "../../src/hooks/useProgress";
import { colors, spacing, fontSize, borderRadius } from "../../src/utils/theme";

export default function ProgressScreen() {
  const { progress, loaded, resetProgress } = useProgress();

  const handleReset = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Reset all progress? This cannot be undone.")) {
        resetProgress();
      }
    } else {
      Alert.alert("Reset Progress", "This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetProgress },
      ]);
    }
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const overallAccuracy =
    progress.totalAttempted > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Overall</Text>
        <View style={styles.overviewStats}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{progress.totalAttempted}</Text>
            <Text style={styles.statLabel}>Attempted</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{progress.totalCorrect}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {overallAccuracy}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
        {progress.totalAttempted > 0 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${overallAccuracy}%` }]}
            />
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>By Category</Text>

      {categories.map((cat) => {
        const stats = progress.categoryStats[cat.id];
        const acc =
          stats && stats.attempted > 0
            ? Math.round((stats.correct / stats.attempted) * 100)
            : null;

        return (
          <View key={cat.id} style={styles.categoryRow}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              {stats && stats.attempted > 0 ? (
                <>
                  <Text style={styles.categoryStats}>
                    {stats.correct}/{stats.attempted} correct
                  </Text>
                  <View style={styles.miniBarContainer}>
                    <View
                      style={[
                        styles.miniBar,
                        {
                          width: `${acc ?? 0}%`,
                          backgroundColor:
                            (acc ?? 0) >= 70
                              ? colors.success
                              : (acc ?? 0) >= 40
                                ? colors.warning
                                : colors.error,
                        },
                      ]}
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.categoryStats}>Not started</Text>
              )}
            </View>
            {acc !== null && (
              <Text
                style={[
                  styles.accPercent,
                  {
                    color:
                      acc >= 70
                        ? colors.success
                        : acc >= 40
                          ? colors.warning
                          : colors.error,
                  },
                ]}
              >
                {acc}%
              </Text>
            )}
          </View>
        );
      })}

      {progress.history.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
            Recent Sessions
          </Text>
          {progress.history.slice(0, 10).map((result, i) => {
            const cat = categories.find((c) => c.id === result.category);
            return (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyIcon}>{cat?.icon ?? "?"}</Text>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>
                    {cat?.name ?? result.category}
                  </Text>
                  <Text style={styles.historyDate}>{result.date}</Text>
                </View>
                <Text style={styles.historyScore}>
                  {result.correctAnswers}/{result.totalQuestions}
                </Text>
              </View>
            );
          })}
        </>
      )}

      {progress.totalAttempted > 0 && (
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset All Progress</Text>
        </Pressable>
      )}
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
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  overviewTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBlock: {
    alignItems: "center",
  },
  statNumber: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  categoryStats: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  miniBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  miniBar: {
    height: 4,
    borderRadius: 2,
  },
  accPercent: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  historyDate: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  historyScore: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  resetButton: {
    marginTop: spacing.xl,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  resetText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
