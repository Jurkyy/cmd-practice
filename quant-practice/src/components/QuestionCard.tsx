import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Question, DIFFICULTY_CONFIG, DURATION_CONFIG, TAG_LABELS } from "../types";
import { colors, spacing, borderRadius, fontSize } from "../utils/theme";

interface Props {
  question: Question;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

export function QuestionCard({
  question,
  selectedIndex,
  revealed,
  onSelect,
  onSubmit,
}: Props) {
  const diff = DIFFICULTY_CONFIG[question.difficulty];
  const dur = DURATION_CONFIG[question.duration];

  const getChoiceStyle = (index: number) => {
    if (!revealed)
      return index === selectedIndex ? styles.choiceSelected : styles.choice;
    if (index === question.correctIndex) return styles.choiceCorrect;
    if (index === selectedIndex && index !== question.correctIndex)
      return styles.choiceWrong;
    return styles.choiceFaded;
  };

  const getLabelColor = (index: number) => {
    if (!revealed) return index === selectedIndex ? colors.primary : colors.textDim;
    if (index === question.correctIndex) return colors.success;
    if (index === selectedIndex) return colors.error;
    return colors.textDim;
  };

  const getTextColor = (index: number) => {
    if (!revealed) return index === selectedIndex ? colors.text : colors.textSecondary;
    if (index === question.correctIndex) return colors.success;
    if (index === selectedIndex) return colors.error;
    return colors.textDim;
  };

  const getIndicator = (index: number) => {
    if (!revealed) return null;
    if (index === question.correctIndex) return "\u2713";
    if (index === selectedIndex && index !== question.correctIndex) return "\u2717";
    return null;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Meta badges */}
      <View style={styles.metaRow}>
        <View style={[styles.badge, { backgroundColor: diff.bg }]}>
          <Text style={[styles.badgeText, { color: diff.color }]}>
            {diff.label}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeTextMuted}>
            {dur.icon} {dur.minutes}
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {question.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{TAG_LABELS[tag]}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.title}>{question.title}</Text>
      <Text style={styles.body}>{question.body}</Text>

      {/* Choices — big, tappable, submit on second tap */}
      <View style={styles.choices}>
        {question.choices.map((choice, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              getChoiceStyle(index),
              pressed && !revealed && styles.choicePressed,
            ]}
            onPress={() => {
              if (revealed) return;
              if (selectedIndex === index) {
                onSubmit();
              } else {
                onSelect(index);
              }
            }}
            disabled={revealed}
          >
            <View
              style={[
                styles.choiceLabelWrap,
                {
                  borderColor: getLabelColor(index),
                  backgroundColor:
                    !revealed && index === selectedIndex
                      ? colors.primaryGlow
                      : "transparent",
                },
              ]}
            >
              <Text style={[styles.choiceLabel, { color: getLabelColor(index) }]}>
                {getIndicator(index) || String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={[styles.choiceText, { color: getTextColor(index) }]}>
              {choice}
            </Text>
          </Pressable>
        ))}
      </View>

      {!revealed && selectedIndex !== null && (
        <Text style={styles.tapHint}>Tap again to confirm</Text>
      )}

      {/* Explanation */}
      {revealed && (
        <View style={styles.explanation}>
          <View style={styles.explanationHeader}>
            <Text style={styles.explanationIcon}>
              {selectedIndex === question.correctIndex ? "\u2713" : "\u2717"}
            </Text>
            <Text
              style={[
                styles.explanationTitle,
                {
                  color:
                    selectedIndex === question.correctIndex
                      ? colors.success
                      : colors.error,
                },
              ]}
            >
              {selectedIndex === question.correctIndex
                ? "Correct!"
                : "Incorrect"}
            </Text>
          </View>
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
    paddingBottom: 100,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgeTextMuted: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.borderAccent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  tagText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "800",
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 26,
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 60,
  },
  choiceSelected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryGlow,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 60,
  },
  choiceCorrect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successBg,
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 60,
  },
  choiceWrong: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorBg,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 60,
  },
  choiceFaded: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 60,
    opacity: 0.4,
  },
  choicePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  choiceLabelWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  choiceLabel: {
    fontSize: fontSize.sm,
    fontWeight: "800",
  },
  choiceText: {
    fontSize: fontSize.md,
    flex: 1,
    fontWeight: "500",
    lineHeight: 22,
  },
  tapHint: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textAlign: "center",
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  explanation: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  explanationIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    fontWeight: "800",
  },
  explanationTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
});
