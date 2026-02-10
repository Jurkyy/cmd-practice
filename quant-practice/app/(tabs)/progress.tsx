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
import { useProgress, getWeakTags } from "../../src/hooks/useProgress";
import { ACHIEVEMENTS, TAG_LABELS, DIFFICULTY_CONFIG, Tag } from "../../src/types";
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

  const weakTags = getWeakTags(progress.tagStats);

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

      {/* Streak */}
      {progress.streak.current > 0 && (
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <Text style={styles.streakFire}>{"\uD83D\uDD25"}</Text>
            <View>
              <Text style={styles.streakValue}>{progress.streak.current} day streak</Text>
              <Text style={styles.streakSub}>Best: {progress.streak.longest} days</Text>
            </View>
          </View>
        </View>
      )}

      {/* Difficulty Breakdown */}
      <Text style={styles.sectionTitle}>BY DIFFICULTY</Text>
      <View style={styles.diffRow}>
        {(["easy", "medium", "hard"] as const).map((d) => {
          const stats = progress.difficultyStats[d];
          const acc = stats.attempted > 0
            ? Math.round((stats.correct / stats.attempted) * 100)
            : null;
          const config = DIFFICULTY_CONFIG[d];
          return (
            <View key={d} style={styles.diffCard}>
              <Text style={[styles.diffLabel, { color: config.color }]}>
                {config.label}
              </Text>
              <Text style={styles.diffCount}>{stats.attempted}</Text>
              <Text style={styles.diffCountLabel}>attempted</Text>
              {acc !== null && (
                <View style={[styles.diffAccBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.diffAccText, { color: config.color }]}>
                    {acc}%
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Tag Analytics / Weak Spots */}
      {weakTags.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
            WEAKEST AREAS
          </Text>
          {weakTags.map(({ tag, accuracy }) => {
            const label = TAG_LABELS[tag as Tag] ?? tag;
            return (
              <View key={tag} style={styles.tagRow}>
                <View style={styles.tagInfo}>
                  <Text style={styles.tagName}>{label}</Text>
                  <View style={styles.tagBarContainer}>
                    <View
                      style={[
                        styles.tagBar,
                        {
                          width: `${accuracy}%`,
                          backgroundColor:
                            accuracy >= 70
                              ? colors.success
                              : accuracy >= 40
                                ? colors.warning
                                : colors.error,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.tagAcc,
                    {
                      color:
                        accuracy >= 70
                          ? colors.success
                          : accuracy >= 40
                            ? colors.warning
                            : colors.error,
                    },
                  ]}
                >
                  {accuracy}%
                </Text>
              </View>
            );
          })}
        </>
      )}

      {/* Categories */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>BY CATEGORY</Text>

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

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
            ACHIEVEMENTS
          </Text>
          <View style={styles.achGrid}>
            {ACHIEVEMENTS.map((ach) => {
              const earned = progress.achievements.includes(ach.id);
              return (
                <View
                  key={ach.id}
                  style={[styles.achCard, !earned && styles.achLocked]}
                >
                  <Text style={[styles.achIcon, !earned && styles.achIconLocked]}>
                    {ach.icon}
                  </Text>
                  <Text style={[styles.achTitle, !earned && styles.achTitleLocked]}>
                    {ach.title}
                  </Text>
                  <Text style={styles.achDesc}>{ach.description}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

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
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  streakFire: {
    fontSize: 28,
  },
  streakValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
  },
  streakSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  diffRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  diffCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  diffLabel: {
    fontSize: fontSize.sm,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  diffCount: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "800",
  },
  diffCountLabel: {
    color: colors.textDim,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  diffAccBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  diffAccText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
    marginBottom: 6,
  },
  tagBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  tagBar: {
    height: 4,
    borderRadius: 2,
  },
  tagAcc: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    marginLeft: spacing.md,
    letterSpacing: -0.3,
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
  achGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  achCard: {
    width: "31%" as unknown as number,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
    flexGrow: 1,
  },
  achLocked: {
    opacity: 0.4,
  },
  achIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achIconLocked: {
    opacity: 0.5,
  },
  achTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  achTitleLocked: {
    color: colors.textDim,
  },
  achDesc: {
    color: colors.textDim,
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
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
