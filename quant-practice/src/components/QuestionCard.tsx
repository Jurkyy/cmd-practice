import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Question, DIFFICULTY_CONFIG, DURATION_CONFIG, TAG_LABELS, RESOURCE_TYPE_CONFIG } from "../types";
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
  const router = useRouter();
  const [hintVisible, setHintVisible] = useState(false);
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

      {/* Hint toggle */}
      {question.hint && !revealed && (
        <Pressable
          style={styles.hintToggle}
          onPress={() => setHintVisible(!hintVisible)}
        >
          <Text style={styles.hintToggleText}>
            {hintVisible ? "\u{1F4A1} Hide Hint" : "\u{1F4A1} Show Hint"}
          </Text>
        </Pressable>
      )}
      {question.hint && hintVisible && !revealed && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>{question.hint}</Text>
        </View>
      )}

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

          {/* Detailed explanation (step-by-step) */}
          {question.detailedExplanation && (
            <View style={styles.detailedBox}>
              <Text style={styles.detailedLabel}>{"\u{1F4CB}"} Step-by-Step</Text>
              <Text style={styles.detailedText}>{question.detailedExplanation}</Text>
            </View>
          )}

          {/* Common mistakes */}
          {selectedIndex !== question.correctIndex &&
            question.commonMistakes &&
            question.commonMistakes.length > 0 && (
              <View style={styles.mistakesBox}>
                <Text style={styles.mistakesLabel}>{"\u26A0\uFE0F"} Common Mistakes</Text>
                {question.commonMistakes.map((m, i) => (
                  <View key={i} style={styles.mistakeRow}>
                    <Text style={styles.mistakeBullet}>{"\u2022"}</Text>
                    <Text style={styles.mistakeText}>{m}</Text>
                  </View>
                ))}
              </View>
            )}

          {/* Concept link to guide */}
          {question.guideSection && (
            <Pressable
              style={({ pressed }) => [
                styles.conceptLink,
                pressed && styles.conceptLinkPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/learn/[category]",
                  params: { category: question.category },
                })
              }
            >
              <Text style={styles.conceptLinkText}>
                {"\uD83D\uDCD6"} Study this concept in the guide
              </Text>
              <Text style={styles.conceptArrow}>{"\u203A"}</Text>
            </Pressable>
          )}

          {/* Per-question resources */}
          {question.resources && question.resources.length > 0 && (
            <View style={styles.resourcesSection}>
              <Text style={styles.resourcesLabel}>{"\u{1F4D6}"} Learn More</Text>
              {question.resources.map((r) => {
                const rConfig = RESOURCE_TYPE_CONFIG[r.type];
                return (
                  <Pressable
                    key={r.url}
                    style={({ pressed }) => [
                      styles.resourceRow,
                      pressed && styles.resourcePressed,
                    ]}
                    onPress={() => Linking.openURL(r.url)}
                  >
                    <Text style={styles.resourceIcon}>{rConfig.icon}</Text>
                    <Text style={styles.resourceTitle} numberOfLines={1}>
                      {r.title}
                    </Text>
                    {r.free && (
                      <View style={styles.resourceFreeBadge}>
                        <Text style={styles.resourceFreeText}>Free</Text>
                      </View>
                    )}
                    <Text style={styles.resourceArrow}>{"\u203A"}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
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
  detailedBox: {
    marginTop: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailedLabel: {
    color: colors.primaryLight,
    fontSize: fontSize.xs,
    fontWeight: "800",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  detailedText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  mistakesBox: {
    marginTop: spacing.md,
    backgroundColor: colors.errorBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.15)",
  },
  mistakesLabel: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: "800",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  mistakeRow: {
    flexDirection: "row" as const,
    marginBottom: 4,
    paddingLeft: 4,
  },
  mistakeBullet: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
    lineHeight: 22,
  },
  mistakeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 22,
  },
  conceptLink: {
    marginTop: spacing.md,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.primaryGlow,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  conceptLinkPressed: {
    opacity: 0.7,
  },
  conceptLinkText: {
    flex: 1,
    color: colors.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: "700",
  },
  conceptArrow: {
    color: colors.primaryLight,
    fontSize: 20,
    fontWeight: "300",
  },
  hintToggle: {
    alignSelf: "flex-start",
    backgroundColor: colors.warningBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  hintToggleText: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  hintBox: {
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.15)",
    marginBottom: spacing.md,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
    fontStyle: "italic",
  },
  resourcesSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  resourcesLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  resourcePressed: {
    opacity: 0.7,
  },
  resourceIcon: {
    fontSize: 16,
  },
  resourceTitle: {
    flex: 1,
    color: colors.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  resourceFreeBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  resourceFreeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  resourceArrow: {
    color: colors.textDim,
    fontSize: 20,
    fontWeight: "300",
  },
});
