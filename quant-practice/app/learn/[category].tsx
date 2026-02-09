import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { topicGuides } from "../../src/data/guides";
import { categories } from "../../src/data/categories";
import { Category, GuideSection } from "../../src/types";
import { ResourceLink } from "../../src/components/ResourceLink";
import { colors, spacing, borderRadius, fontSize } from "../../src/utils/theme";

function SectionCard({
  section,
  index,
  accentColor,
}: {
  section: GuideSection;
  index: number;
  accentColor: string;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <View style={styles.sectionCard}>
      <Pressable
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View
          style={[styles.sectionNumber, { backgroundColor: accentColor + "25" }]}
        >
          <Text style={[styles.sectionNumberText, { color: accentColor }]}>
            {index + 1}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.chevron}>{expanded ? "\u25B2" : "\u25BC"}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.sectionBody}>
          <Text style={styles.sectionContent}>{section.content}</Text>

          {section.keyFormulas && section.keyFormulas.length > 0 && (
            <View style={styles.formulaBox}>
              <Text style={styles.formulaLabel}>Key Formulas</Text>
              {section.keyFormulas.map((f, i) => (
                <View key={i} style={styles.formulaRow}>
                  <Text style={styles.formulaBullet}>{"\u2022"}</Text>
                  <Text style={styles.formulaText}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          {section.tips && section.tips.length > 0 && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsLabel}>{"\ud83d\udca1"} Tips</Text>
              {section.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>{"\u2022"}</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function GuideDetailScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();

  const guide = topicGuides.find((g) => g.category === category);
  const catInfo = categories.find((c) => c.id === category);

  if (!guide || !catInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Guide not found</Text>
      </View>
    );
  }

  const accentColor = catInfo.color;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[styles.headerIcon, { backgroundColor: accentColor + "20" }]}
        >
          <Text style={styles.headerIconText}>{guide.icon}</Text>
        </View>
        <Text style={styles.headerTitle}>{guide.title}</Text>
        <Text style={styles.headerOverview}>{guide.overview}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: accentColor }]}>
              {guide.sections.length}
            </Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: accentColor }]}>
              {guide.sections.reduce(
                (sum, s) => sum + (s.keyFormulas?.length ?? 0),
                0
              )}
            </Text>
            <Text style={styles.statLabel}>Formulas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: accentColor }]}>
              {guide.resources.length}
            </Text>
            <Text style={styles.statLabel}>Resources</Text>
          </View>
        </View>
      </View>

      {/* Sections */}
      <View style={styles.sectionsContainer}>
        <Text style={styles.groupTitle}>Topics</Text>
        {guide.sections.map((section, i) => (
          <SectionCard
            key={section.title}
            section={section}
            index={i}
            accentColor={accentColor}
          />
        ))}
      </View>

      {/* Resources */}
      <View style={styles.resourcesContainer}>
        <Text style={styles.groupTitle}>Recommended Resources</Text>
        <View style={styles.resourcesList}>
          {guide.resources.map((r) => (
            <ResourceLink key={r.url} resource={r} />
          ))}
        </View>
      </View>

      {/* Practice CTA */}
      <View style={styles.ctaContainer}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={() =>
            router.push({
              pathname: "/quiz/[category]",
              params: { category: guide.category },
            })
          }
        >
          <Text style={styles.ctaText}>
            Practice {catInfo.name} Questions {"\u2192"}
          </Text>
        </Pressable>
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
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
    marginTop: 100,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: "center",
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerIconText: {
    fontSize: 32,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  headerOverview: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  sectionsContainer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  groupTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionNumberText: {
    fontSize: fontSize.sm,
    fontWeight: "800",
  },
  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  chevron: {
    color: colors.textDim,
    fontSize: 10,
  },
  sectionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  sectionContent: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  formulaBox: {
    backgroundColor: colors.primaryGlow,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  formulaLabel: {
    color: colors.primaryLight,
    fontSize: fontSize.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  formulaRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 4,
  },
  formulaBullet: {
    color: colors.primary,
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
    lineHeight: 22,
  },
  formulaText: {
    color: colors.text,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 22,
    fontFamily: "monospace",
  },
  tipsBox: {
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.15)",
  },
  tipsLabel: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 4,
  },
  tipBullet: {
    color: colors.warning,
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
    lineHeight: 22,
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 22,
  },
  resourcesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  resourcesList: {
    gap: spacing.sm,
  },
  ctaContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});
