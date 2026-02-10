import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { topicGuides } from "../../src/data/guides";
import { learningPaths } from "../../src/data/paths";
import { categories } from "../../src/data/categories";
import { useSubscription, FREE_LIMITS } from "../../src/hooks/useSubscription";
import { DIFFICULTY_CONFIG } from "../../src/types";
import { colors, spacing, borderRadius, fontSize, shadowSmall } from "../../src/utils/theme";

export default function LearnScreen() {
  const router = useRouter();
  const { isPro } = useSubscription();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>LEARN</Text>
        <Text style={styles.heroTitle}>Study Guides</Text>
        <Text style={styles.heroSub}>
          Deep-dive into each topic with key formulas, tips, and curated resources.
        </Text>
      </View>

      {/* Learning Paths */}
      <View style={styles.pathsSection}>
        <Text style={styles.pathsSectionTitle}>Learning Paths</Text>
        <Text style={styles.pathsSub}>
          Curated sequences to build skills step by step
        </Text>
        {learningPaths.map((path, idx) => {
          const diffConfig = DIFFICULTY_CONFIG[path.difficulty];
          const guideSteps = path.steps.filter((s) => s.type === "guide").length;
          const quizSteps = path.steps.filter((s) => s.type === "quiz").length;
          const locked = !isPro && idx >= FREE_LIMITS.learningPaths;
          return (
            <Pressable
              key={path.id}
              style={({ pressed }) => [
                styles.pathCard,
                pressed && styles.cardPressed,
                locked && styles.pathLocked,
              ]}
              onPress={() => {
                if (locked) {
                  router.push("/paywall");
                } else {
                  router.push({
                    pathname: "/learn/path/[id]",
                    params: { id: path.id },
                  });
                }
              }}
            >
              <View style={styles.pathHeader}>
                <Text style={styles.pathIcon}>{locked ? "\uD83D\uDD12" : path.icon}</Text>
                <View style={styles.pathMeta}>
                  <Text style={styles.pathTitle}>{path.title}</Text>
                  <View style={styles.pathBadges}>
                    <View style={[styles.diffBadge, { backgroundColor: diffConfig.bg }]}>
                      <Text style={[styles.diffBadgeText, { color: diffConfig.color }]}>
                        {diffConfig.label}
                      </Text>
                    </View>
                    <Text style={styles.pathEstimate}>
                      ~{path.estimatedHours}h
                    </Text>
                    {locked && (
                      <Text style={styles.pathProLabel}>PRO</Text>
                    )}
                  </View>
                </View>
              </View>
              <Text style={styles.pathDesc} numberOfLines={2}>
                {path.description}
              </Text>
              <View style={styles.pathFooter}>
                <Text style={styles.pathStepCount}>
                  {guideSteps} guides {"\u00b7"} {quizSteps} quizzes {"\u00b7"} {path.steps.length} steps
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Guide cards */}
      <View style={styles.guidesHeader}>
        <Text style={styles.pathsSectionTitle}>Topic Guides</Text>
      </View>
      <View style={styles.guides}>
        {topicGuides.map((guide) => {
          const catInfo = categories.find((c) => c.id === guide.category);
          const sectionCount = guide.sections.length;
          const resourceCount = guide.resources.length;

          return (
            <Pressable
              key={guide.category}
              style={({ pressed }) => [
                styles.guideCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/learn/[category]",
                  params: { category: guide.category },
                })
              }
            >
              {/* Accent bar */}
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: catInfo?.color ?? colors.primary },
                ]}
              />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor:
                          (catInfo?.color ?? colors.primary) + "20",
                      },
                    ]}
                  >
                    <Text style={styles.icon}>{guide.icon}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle}>{guide.title}</Text>
                    <Text style={styles.cardSub}>
                      {sectionCount} sections {"\u00b7"} {resourceCount} resources
                    </Text>
                  </View>
                </View>

                <Text style={styles.overview} numberOfLines={2}>
                  {guide.overview}
                </Text>

                {/* Section pills */}
                <View style={styles.sectionPills}>
                  {guide.sections.map((s) => (
                    <View key={s.title} style={styles.pill}>
                      <Text style={styles.pillText}>{s.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* General resources */}
      <View style={styles.generalSection}>
        <Text style={styles.sectionTitle}>General Quant Resources</Text>
        <View style={styles.generalCards}>
          {[
            {
              icon: "\ud83d\udcda",
              title: "Heard on the Street",
              sub: "Timothy Crack \u2014 Classic interview prep",
            },
            {
              icon: "\ud83d\udcd7",
              title: "Green Book",
              sub: "Xinfeng Zhou \u2014 Quant interview guide",
            },
            {
              icon: "\ud83c\udfac",
              title: "MIT 18.S096",
              sub: "Topics in Math with Applications in Finance",
            },
            {
              icon: "\ud83e\udde0",
              title: "BrainStellar",
              sub: "Free puzzle & brain teaser practice",
            },
          ].map((item) => (
            <View key={item.title} style={styles.generalCard}>
              <Text style={styles.generalIcon}>{item.icon}</Text>
              <Text style={styles.generalTitle}>{item.title}</Text>
              <Text style={styles.generalSub}>{item.sub}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + 20,
    paddingBottom: spacing.lg,
  },
  heroLabel: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  pathsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  pathsSectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  pathsSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  pathCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadowSmall,
  },
  pathLocked: {
    opacity: 0.6,
  },
  pathProLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  pathHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  pathIcon: {
    fontSize: 32,
  },
  pathMeta: {
    flex: 1,
  },
  pathTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  pathBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  pathEstimate: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  pathDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  pathFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  pathStepCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  guidesHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  guides: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadowSmall,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  accentBar: {
    height: 3,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  overview: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  sectionPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    backgroundColor: colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  generalSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  generalCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  generalCard: {
    width: "48%" as unknown as number,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minWidth: 150,
    flexGrow: 1,
  },
  generalIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  generalTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
    marginBottom: 2,
  },
  generalSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
