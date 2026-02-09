import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import {
  Difficulty,
  Duration,
  DIFFICULTY_CONFIG,
  DURATION_CONFIG,
} from "../types";
import { colors, spacing, borderRadius, fontSize } from "../utils/theme";

interface Props {
  selectedDifficulty: Difficulty | null;
  selectedDuration: Duration | null;
  onDifficultyChange: (d: Difficulty | null) => void;
  onDurationChange: (d: Duration | null) => void;
  questionCount: number;
}

export function FilterBar({
  selectedDifficulty,
  selectedDuration,
  onDifficultyChange,
  onDurationChange,
  questionCount,
}: Props) {
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const durations: Duration[] = ["quick", "medium", "long"];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Difficulty pills */}
        {difficulties.map((d) => {
          const conf = DIFFICULTY_CONFIG[d];
          const active = selectedDifficulty === d;
          return (
            <Pressable
              key={d}
              style={[
                styles.pill,
                active && { backgroundColor: conf.color + "25", borderColor: conf.color },
              ]}
              onPress={() => onDifficultyChange(active ? null : d)}
            >
              <Text
                style={[
                  styles.pillText,
                  active && { color: conf.color },
                ]}
              >
                {conf.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.separator} />

        {/* Duration pills */}
        {durations.map((d) => {
          const conf = DURATION_CONFIG[d];
          const active = selectedDuration === d;
          return (
            <Pressable
              key={d}
              style={[
                styles.pill,
                active && { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ]}
              onPress={() => onDurationChange(active ? null : d)}
            >
              <Text
                style={[
                  styles.pillText,
                  active && { color: colors.primaryLight },
                ]}
              >
                {conf.icon} {conf.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.countLabel}>{questionCount} questions</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingRight: spacing.md,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.glass,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginHorizontal: 4,
  },
  countLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },
});
