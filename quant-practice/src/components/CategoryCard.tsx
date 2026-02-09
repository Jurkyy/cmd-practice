import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { CategoryInfo } from "../types";
import { colors, spacing, borderRadius, fontSize } from "../utils/theme";

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

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: category.color },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{category.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.description}>{category.description}</Text>
        </View>
      </View>
      {stats && stats.attempted > 0 && (
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            {stats.attempted} attempted
          </Text>
          <Text
            style={[
              styles.statText,
              accuracy !== null && accuracy >= 70
                ? styles.good
                : accuracy !== null && accuracy >= 40
                  ? styles.ok
                  : styles.bad,
            ]}
          >
            {accuracy}% correct
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  good: { color: colors.success },
  ok: { color: colors.warning },
  bad: { color: colors.error },
});
