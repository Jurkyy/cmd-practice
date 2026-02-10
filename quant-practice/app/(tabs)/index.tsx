import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { categories } from "../../src/data/categories";
import { questions } from "../../src/data/questions";
import { CategoryCard } from "../../src/components/CategoryCard";
import { FilterBar } from "../../src/components/FilterBar";
import { useProgress, getReviewQueue, getWeakTags } from "../../src/hooks/useProgress";
import { Difficulty, Duration, TAG_LABELS, ACHIEVEMENTS, Tag } from "../../src/types";
import { colors, spacing, fontSize, borderRadius, shadow } from "../../src/utils/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { progress, loaded, newAchievements, dismissAchievements } =
    useProgress();
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

  // Review queue
  const reviewIds = useMemo(
    () => (loaded ? getReviewQueue(progress.srData) : []),
    [loaded, progress.srData]
  );
  const reviewCount = reviewIds.length;

  // Weak tags
  const weakTags = useMemo(
    () => (loaded ? getWeakTags(progress.tagStats) : []),
    [loaded, progress.tagStats]
  );

  // Achievement toast
  const earnedAchievement = useMemo(() => {
    if (newAchievements.length === 0) return null;
    return ACHIEVEMENTS.find((a) => a.id === newAchievements[0]) ?? null;
  }, [newAchievements]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Achievement toast modal */}
      <Modal
        visible={!!earnedAchievement}
        transparent
        animationType="fade"
        onRequestClose={dismissAchievements}
      >
        <Pressable style={styles.modalOverlay} onPress={dismissAchievements}>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>
              {earnedAchievement?.icon}
            </Text>
            <Text style={styles.achievementUnlocked}>Achievement Unlocked!</Text>
            <Text style={styles.achievementTitle}>
              {earnedAchievement?.title}
            </Text>
            <Text style={styles.achievementDesc}>
              {earnedAchievement?.description}
            </Text>
            <Pressable style={styles.achievementDismiss} onPress={dismissAchievements}>
              <Text style={styles.achievementDismissText}>Nice!</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>QUANT</Text>
        <Text style={styles.heroTitle}>Practice</Text>
        <Text style={styles.heroSub}>
          {questions.length} questions across {categories.length} topics
        </Text>
      </View>

      {/* Streak + Quick stats */}
      {loaded && progress.totalAttempted > 0 && (
        <View style={styles.statsCard}>
          {progress.streak.current > 0 && (
            <View style={styles.streakBanner}>
              <Text style={styles.streakIcon}>{"\uD83D\uDD25"}</Text>
              <Text style={styles.streakText}>
                {progress.streak.current} day streak
              </Text>
              {progress.streak.longest > progress.streak.current && (
                <Text style={styles.streakBest}>
                  Best: {progress.streak.longest}
                </Text>
              )}
            </View>
          )}
          <View style={styles.statsRow}>
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
          {/* Difficulty breakdown */}
          <View style={styles.diffBreakdown}>
            {(["easy", "medium", "hard"] as const).map((d) => {
              const ds = progress.difficultyStats[d];
              const acc =
                ds.attempted > 0
                  ? Math.round((ds.correct / ds.attempted) * 100)
                  : null;
              return (
                <View key={d} style={styles.diffItem}>
                  <Text
                    style={[
                      styles.diffLabel,
                      {
                        color:
                          d === "easy"
                            ? colors.success
                            : d === "medium"
                              ? colors.warning
                              : colors.error,
                      },
                    ]}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Text>
                  <Text style={styles.diffValue}>
                    {acc !== null ? `${acc}%` : "\u2014"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Review queue banner */}
      {reviewCount > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.reviewBanner,
            pressed && styles.reviewPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: "/quiz/[category]",
              params: { category: "review" },
            })
          }
        >
          <Text style={styles.reviewIcon}>{"\uD83D\uDD04"}</Text>
          <View style={styles.reviewText}>
            <Text style={styles.reviewTitle}>
              {reviewCount} question{reviewCount !== 1 ? "s" : ""} due for review
            </Text>
            <Text style={styles.reviewSub}>
              Spaced repetition keeps knowledge fresh
            </Text>
          </View>
          <View style={styles.reviewGo}>
            <Text style={styles.reviewGoText}>Review</Text>
          </View>
        </Pressable>
      )}

      {/* Weak spots */}
      {weakTags.length > 0 && (
        <View style={styles.weakSection}>
          <Text style={styles.weakTitle}>{"\u{1F4CA}"} Focus Areas</Text>
          <View style={styles.weakTags}>
            {weakTags.map((wt) => (
              <View key={wt.tag} style={styles.weakTag}>
                <Text style={styles.weakTagName}>
                  {TAG_LABELS[wt.tag as Tag] ?? wt.tag}
                </Text>
                <Text
                  style={[
                    styles.weakTagAcc,
                    {
                      color:
                        wt.accuracy >= 70
                          ? colors.success
                          : wt.accuracy >= 40
                            ? colors.warning
                            : colors.error,
                    },
                  ]}
                >
                  {wt.accuracy}%
                </Text>
              </View>
            ))}
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
          <Text style={styles.mixSub}>
            Random questions from all categories
          </Text>
        </View>
        <View style={styles.mixGo}>
          <Text style={styles.mixGoText}>Go</Text>
        </View>
      </Pressable>

      {/* Mental Math Drill */}
      <Pressable
        style={({ pressed }) => [
          styles.drillButton,
          pressed && styles.mixPressed,
        ]}
        onPress={() => router.push("/drill")}
      >
        <Text style={styles.mixIcon}>{"\uD83E\uDDEE"}</Text>
        <View style={styles.mixText}>
          <Text style={styles.mixTitle}>Mental Math Drill</Text>
          <Text style={styles.mixSub}>
            Timed arithmetic {"\u2014"} sharpen your speed
          </Text>
        </View>
        <View style={styles.drillGo}>
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

      {/* Achievements section */}
      {loaded && progress.achievements.length > 0 && (
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <View style={styles.achievementsList}>
            {ACHIEVEMENTS.filter((a) =>
              progress.achievements.includes(a.id)
            ).map((a) => (
              <View key={a.id} style={styles.achBadge}>
                <Text style={styles.achBadgeIcon}>{a.icon}</Text>
                <Text style={styles.achBadgeTitle}>{a.title}</Text>
              </View>
            ))}
            {ACHIEVEMENTS.filter(
              (a) => !progress.achievements.includes(a.id)
            )
              .slice(0, 3)
              .map((a) => (
                <View key={a.id} style={styles.achBadgeLocked}>
                  <Text style={styles.achBadgeIconLocked}>{"?"}</Text>
                  <Text style={styles.achBadgeTitleLocked}>{a.description}</Text>
                </View>
              ))}
          </View>
        </View>
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  streakIcon: {
    fontSize: 20,
  },
  streakText: {
    color: colors.warning,
    fontSize: fontSize.md,
    fontWeight: "800",
    flex: 1,
  },
  streakBest: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
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
  diffBreakdown: {
    flexDirection: "row",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: "space-around",
  },
  diffItem: {
    alignItems: "center",
  },
  diffLabel: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  diffValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
    marginTop: 2,
  },
  reviewBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)",
  },
  reviewPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  reviewIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  reviewText: {
    flex: 1,
  },
  reviewTitle: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  reviewSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  reviewGo: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  reviewGoText: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  weakSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weakTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  weakTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  weakTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  weakTagName: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  weakTagAcc: {
    fontSize: fontSize.xs,
    fontWeight: "800",
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
  drillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentGlow,
  },
  drillGo: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
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
  achievementsSection: {
    marginTop: spacing.lg,
  },
  achievementsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  achBadge: {
    backgroundColor: colors.primaryGlow,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  achBadgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achBadgeTitle: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  achBadgeLocked: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.5,
  },
  achBadgeIconLocked: {
    fontSize: 24,
    marginBottom: 4,
    color: colors.textDim,
  },
  achBadgeTitleLocked: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  // Achievement toast modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  achievementCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    width: "100%",
    maxWidth: 320,
    ...shadow,
  },
  achievementEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  achievementUnlocked: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  achievementDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  achievementDismiss: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  achievementDismissText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});
