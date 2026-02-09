import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Easing } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { categories } from "../../src/data/categories";
import { colors, spacing, fontSize, borderRadius, shadow } from "../../src/utils/theme";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    correct: string;
    total: string;
    category: string;
    time: string;
  }>();

  const correct = parseInt(params.correct ?? "0", 10);
  const total = parseInt(params.total ?? "0", 10);
  const timeMs = parseInt(params.time ?? "0", 10);
  const cat = categories.find((c) => c.id === params.category);
  const isAll = params.category === "all";

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);

  // Animated score reveal
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scaleAnim, fadeAnim, slideAnim]);

  const getMessage = () => {
    if (percentage === 100) return "Perfect!";
    if (percentage >= 80) return "Excellent!";
    if (percentage >= 60) return "Well done!";
    if (percentage >= 40) return "Getting there!";
    return "Keep at it!";
  };

  const getEmoji = () => {
    if (percentage === 100) return "\u{1F31F}";
    if (percentage >= 80) return "\u{1F525}";
    if (percentage >= 60) return "\u{1F4AA}";
    if (percentage >= 40) return "\u{1F9E0}";
    return "\u{1F4D6}";
  };

  const getColor = () => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      {/* Score card */}
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.emoji}>{getEmoji()}</Text>

        <Text style={styles.categoryLabel}>
          {isAll ? "\u26A1 Quick Mix" : `${cat?.icon ?? ""} ${cat?.name ?? params.category}`}
        </Text>

        <Text style={[styles.percentage, { color: getColor() }]}>
          {percentage}%
        </Text>
        <Text style={styles.message}>{getMessage()}</Text>

        {/* Score dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.scoreDot,
                {
                  backgroundColor:
                    i < correct ? colors.success : colors.error,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {correct}/{total}
            </Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {minutes > 0 ? `${minutes}m ` : ""}
              {seconds}s
            </Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {total > 0 ? Math.round(timeMs / total / 1000) : 0}s
            </Text>
            <Text style={styles.statLabel}>Avg/Q</Text>
          </View>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            router.replace({
              pathname: `/quiz/${params.category}`,
            })
          }
        >
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>

        {!isAll && percentage < 80 && (
          <Pressable
            style={({ pressed }) => [
              styles.studyButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/learn/[category]",
                params: { category: params.category ?? "" },
              })
            }
          >
            <Text style={styles.studyText}>
              {"\u{1F4D6}"} Study {cat?.name ?? "Topic"} Guide
            </Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.homeText}>Back to Home</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  percentage: {
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: -2,
  },
  message: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "800",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.lg,
  },
  scoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  retryText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  studyButton: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.md,
  },
  studyText: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  homeButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: spacing.md,
  },
  homeText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
