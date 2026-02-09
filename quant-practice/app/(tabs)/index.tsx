import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { categories } from "../../src/data/categories";
import { CategoryCard } from "../../src/components/CategoryCard";
import { useProgress } from "../../src/hooks/useProgress";
import { colors, spacing, fontSize } from "../../src/utils/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { progress, loaded } = useProgress();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Quant Practice</Text>
        <Text style={styles.heroSubtitle}>
          Sharpen your quantitative finance skills
        </Text>
        {loaded && progress.totalAttempted > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{progress.totalAttempted}</Text>
              <Text style={styles.summaryLabel}>Questions</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {progress.totalAttempted > 0
                  ? Math.round(
                      (progress.totalCorrect / progress.totalAttempted) * 100
                    )
                  : 0}
                %
              </Text>
              <Text style={styles.summaryLabel}>Accuracy</Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Choose a Topic</Text>

      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          stats={progress.categoryStats[cat.id]}
          onPress={() => router.push(`/quiz/${cat.id}`)}
        />
      ))}
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
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  summaryItem: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  summaryNumber: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
});
