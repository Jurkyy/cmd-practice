import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { learningPaths } from "../../../src/data/paths";
import { categories } from "../../../src/data/categories";
import { DIFFICULTY_CONFIG } from "../../../src/types";
import { colors, spacing, fontSize, borderRadius } from "../../../src/utils/theme";

export default function LearningPathScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const path = learningPaths.find((p) => p.id === id);

  if (!path) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Path not found</Text>
      </View>
    );
  }

  const diffConfig = DIFFICULTY_CONFIG[path.difficulty];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{path.icon}</Text>
        <Text style={styles.headerTitle}>{path.title}</Text>
        <Text style={styles.headerDesc}>{path.description}</Text>
        <View style={styles.headerMeta}>
          <View style={[styles.badge, { backgroundColor: diffConfig.bg }]}>
            <Text style={[styles.badgeText, { color: diffConfig.color }]}>
              {diffConfig.label}
            </Text>
          </View>
          <Text style={styles.metaText}>
            ~{path.estimatedHours} hours
          </Text>
          <Text style={styles.metaText}>
            {path.steps.length} steps
          </Text>
        </View>
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>Path Steps</Text>
        {path.steps.map((step, i) => {
          const catInfo = categories.find((c) => c.id === step.category);
          const isGuide = step.type === "guide";

          return (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.stepCard,
                pressed && styles.stepPressed,
              ]}
              onPress={() => {
                if (isGuide) {
                  router.push({
                    pathname: "/learn/[category]",
                    params: { category: step.category },
                  });
                } else {
                  router.push({
                    pathname: "/quiz/[category]",
                    params: {
                      category: step.category,
                      ...(step.difficulty ? { difficulty: step.difficulty } : {}),
                    },
                  });
                }
              }}
            >
              {/* Step number + connector line */}
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.stepNumber,
                    {
                      backgroundColor: isGuide
                        ? colors.primaryGlow
                        : colors.accentGlow,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumberText,
                      {
                        color: isGuide ? colors.primaryLight : colors.accent,
                      },
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
                {i < path.steps.length - 1 && (
                  <View style={styles.connector} />
                )}
              </View>

              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: isGuide
                          ? colors.primaryGlow
                          : colors.accentGlow,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        {
                          color: isGuide ? colors.primaryLight : colors.accent,
                        },
                      ]}
                    >
                      {isGuide ? "\uD83D\uDCD6 GUIDE" : "\u2753 QUIZ"}
                    </Text>
                  </View>
                  {catInfo && (
                    <Text style={styles.stepCat}>
                      {catInfo.icon} {catInfo.name}
                    </Text>
                  )}
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
                {step.difficulty && (
                  <View
                    style={[
                      styles.diffBadge,
                      { backgroundColor: DIFFICULTY_CONFIG[step.difficulty].bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.diffBadgeText,
                        { color: DIFFICULTY_CONFIG[step.difficulty].color },
                      ]}
                    >
                      {DIFFICULTY_CONFIG[step.difficulty].label}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  headerDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  metaText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  stepsContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  stepCard: {
    flexDirection: "row",
    marginBottom: 0,
  },
  stepPressed: {
    opacity: 0.8,
  },
  stepLeft: {
    alignItems: "center",
    width: 40,
    marginRight: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: fontSize.sm,
    fontWeight: "800",
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  stepCat: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  stepTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
    marginBottom: 4,
  },
  stepDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  diffBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
