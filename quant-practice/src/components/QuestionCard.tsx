import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Question } from "../types";
import { colors, spacing, borderRadius, fontSize } from "../utils/theme";

interface Props {
  question: Question;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
}

export function QuestionCard({
  question,
  selectedIndex,
  revealed,
  onSelect,
}: Props) {
  const getChoiceStyle = (index: number) => {
    if (!revealed) {
      return index === selectedIndex ? styles.choiceSelected : styles.choice;
    }
    if (index === question.correctIndex) return styles.choiceCorrect;
    if (index === selectedIndex && index !== question.correctIndex)
      return styles.choiceWrong;
    return styles.choice;
  };

  const getChoiceTextStyle = (index: number) => {
    if (!revealed) {
      return index === selectedIndex
        ? styles.choiceTextSelected
        : styles.choiceText;
    }
    if (index === question.correctIndex) return styles.choiceTextCorrect;
    if (index === selectedIndex && index !== question.correctIndex)
      return styles.choiceTextWrong;
    return styles.choiceText;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.difficultyRow}>
        <View
          style={[
            styles.badge,
            question.difficulty === "easy"
              ? styles.badgeEasy
              : question.difficulty === "medium"
                ? styles.badgeMedium
                : styles.badgeHard,
          ]}
        >
          <Text style={styles.badgeText}>{question.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.title}>{question.title}</Text>
      <Text style={styles.body}>{question.body}</Text>

      <View style={styles.choices}>
        {question.choices.map((choice, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              getChoiceStyle(index),
              pressed && !revealed && styles.choicePressed,
            ]}
            onPress={() => !revealed && onSelect(index)}
            disabled={revealed}
          >
            <Text style={styles.choiceLabel}>
              {String.fromCharCode(65 + index)}
            </Text>
            <Text style={getChoiceTextStyle(index)}>{choice}</Text>
          </Pressable>
        ))}
      </View>

      {revealed && (
        <View style={styles.explanation}>
          <Text style={styles.explanationTitle}>Explanation</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  difficultyRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeEasy: { backgroundColor: "#22c55e33" },
  badgeMedium: { backgroundColor: "#f59e0b33" },
  badgeHard: { backgroundColor: "#ef444433" },
  badgeText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  choices: {
    gap: spacing.sm,
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  choiceSelected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f622",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  choiceCorrect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e22",
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  choiceWrong: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef444422",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  choicePressed: {
    opacity: 0.7,
  },
  choiceLabel: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: "700",
    marginRight: spacing.md,
    width: 24,
  },
  choiceText: {
    color: colors.text,
    fontSize: fontSize.md,
    flex: 1,
  },
  choiceTextSelected: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: "600",
    flex: 1,
  },
  choiceTextCorrect: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: "600",
    flex: 1,
  },
  choiceTextWrong: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: "600",
    flex: 1,
  },
  explanation: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  explanationTitle: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
});
