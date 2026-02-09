import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { CategoryInfo } from "../types";
import { questions } from "../data/questions";
import { colors, spacing, borderRadius, fontSize, shadowSmall } from "../utils/theme";

interface Props {
  category: CategoryInfo;
  stats?: { attempted: number; correct: number };
  onPress: () => void;
}

export function CategoryCard({ category, stats, onPress }: Props) {
  const accuracy =
    stats && stats.attempted > 0
      ? Math.round((stats.correct / stats.attempted) * 100)
      : null;

  const questionCount = questions.filter(
    (q) => q.category === category.id
  ).length;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.accentBar, { backgroundColor: category.color }]} />
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: category.color + "18" }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{category.name}</Text>
            <Text style={styles.description}>{category.description}</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{questionCount}</Text>
          </View>
        </View>
        {stats && stats.attempted > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.progressBarOuter}>
              <View
                style={[
                  styles.progressBarInner,
                  {
                    width: `${accuracy ?? 0}%`,
                    backgroundColor:
                      (accuracy ?? 0) >= 70
                        ? colors.success
                        : (accuracy ?? 0) >= 40
                          ? colors.warning
                          : colors.error,
                  },
                ]}
              />
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                {stats.correct}/{stats.attempted}
              </Text>
              <Text
                style={[
                  styles.accText,
                  {
                    color:
                      (accuracy ?? 0) >= 70
                        ? colors.success
                        : (accuracy ?? 0) >= 40
                          ? colors.warning
                          : colors.error,
                  },
                ]}
              >
                {accuracy}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowSmall,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  accentBar: {
    height: 3,
    width: "100%",
  },
  inner: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  statsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressBarOuter: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: 4,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  statText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
  },
  accText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
});
