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
import { colors, spacing, fontSize, borderRadius, shadow } from "../../src/utils/theme";

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
      showsVerticalScrollIndicator={false}
    >
      {/* Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Overview</Text>
          {progress.totalAttempted > 0 && (
            <View style={styles.accBadge}>
              <Text style={[styles.accBadgeText, { color: overallAccuracy >= 70 ? colors.success : overallAccuracy >= 40 ? colors.warning : colors.error }]}>
                {overallAccuracy}%
              </Text>
            </View>
          )}
        </View>
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
            <Text style={styles.statNumber}>
              {progress.history.length}
            </Text>
            <Text style={styles.statLabel}>Sessions</Text>
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

      {/* Categories */}
      <Text style={styles.sectionTitle}>BY CATEGORY</Text>

      {categories.map((cat) => {
        const stats = progress.categoryStats[cat.id];
        const acc =
          stats && stats.attempted > 0
            ? Math.round((stats.correct / stats.attempted) * 100)
            : null;

        return (
          <View key={cat.id} style={styles.categoryRow}>
            <View style={[styles.catIconWrap, { backgroundColor: cat.color + "18" }]}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
            </View>
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
                <Text style={styles.notStarted}>Not started</Text>
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

      {/* Recent */}
      {progress.history.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
            RECENT
          </Text>
          {progress.history.slice(0, 10).map((result, i) => {
            const rCat = categories.find((c) => c.id === result.category);
            const pct =
              result.totalQuestions > 0
                ? Math.round(
                    (result.correctAnswers / result.totalQuestions) * 100
                  )
                : 0;
            return (
              <View key={i} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyIcon}>{rCat?.icon ?? "\u26A1"}</Text>
                  <View>
                    <Text style={styles.historyName}>
                      {rCat?.name ?? "Quick Mix"}
                    </Text>
                    <Text style={styles.historyDate}>{result.date}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyScore}>
                    {result.correctAnswers}/{result.totalQuestions}
                  </Text>
                  <View
                    style={[
                      styles.historyPctBadge,
                      {
                        backgroundColor:
                          pct >= 70
                            ? colors.successBg
                            : pct >= 40
                              ? colors.warningBg
                              : colors.errorBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyPct,
                        {
                          color:
                            pct >= 70
                              ? colors.success
                              : pct >= 40
                                ? colors.warning
                                : colors.error,
                        },
                      ]}
                    >
                      {pct}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Reset */}
      {progress.totalAttempted > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleReset}
        >
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
    paddingBottom: spacing.xxl + 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  overviewTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  accBadge: {
    backgroundColor: colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: "800",
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
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: spacing.lg,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  categoryStats: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  notStarted: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
    fontStyle: "italic",
  },
  miniBarContainer: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  miniBar: {
    height: 3,
    borderRadius: 2,
  },
  accPercent: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    marginLeft: spacing.sm,
    letterSpacing: -0.3,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  historyIcon: {
    fontSize: 20,
  },
  historyName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  historyDate: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  historyScore: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  historyPctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  historyPct: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  resetButton: {
    marginTop: spacing.xl,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.errorBg,
    backgroundColor: colors.errorBg,
  },
  resetText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
});
