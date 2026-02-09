import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { topicGuides } from "../../src/data/guides";
import { categories } from "../../src/data/categories";
import { colors, spacing, borderRadius, fontSize, shadowSmall } from "../../src/utils/theme";

export default function LearnScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>LEARN</Text>
        <Text style={styles.heroTitle}>Study Guides</Text>
        <Text style={styles.heroSub}>
          Deep-dive into each topic with key formulas, tips, and curated resources.
        </Text>
      </View>

      {/* Guide cards */}
      <View style={styles.guides}>
        {topicGuides.map((guide) => {
          const catInfo = categories.find((c) => c.id === guide.category);
          const sectionCount = guide.sections.length;
          const resourceCount = guide.resources.length;

          return (
            <Pressable
              key={guide.category}
              style={({ pressed }) => [
                styles.guideCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/learn/[category]",
                  params: { category: guide.category },
                })
              }
            >
              {/* Accent bar */}
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: catInfo?.color ?? colors.primary },
                ]}
              />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor:
                          (catInfo?.color ?? colors.primary) + "20",
                      },
                    ]}
                  >
                    <Text style={styles.icon}>{guide.icon}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle}>{guide.title}</Text>
                    <Text style={styles.cardSub}>
                      {sectionCount} sections {"\u00b7"} {resourceCount} resources
                    </Text>
                  </View>
                </View>

                <Text style={styles.overview} numberOfLines={2}>
                  {guide.overview}
                </Text>

                {/* Section pills */}
                <View style={styles.sectionPills}>
                  {guide.sections.map((s) => (
                    <View key={s.title} style={styles.pill}>
                      <Text style={styles.pillText}>{s.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* General resources */}
      <View style={styles.generalSection}>
        <Text style={styles.sectionTitle}>General Quant Resources</Text>
        <View style={styles.generalCards}>
          {[
            {
              icon: "\ud83d\udcda",
              title: "Heard on the Street",
              sub: "Timothy Crack \u2014 Classic interview prep",
            },
            {
              icon: "\ud83d\udcd7",
              title: "Green Book",
              sub: "Xinfeng Zhou \u2014 Quant interview guide",
            },
            {
              icon: "\ud83c\udfac",
              title: "MIT 18.S096",
              sub: "Topics in Math with Applications in Finance",
            },
            {
              icon: "\ud83e\udde0",
              title: "BrainStellar",
              sub: "Free puzzle & brain teaser practice",
            },
          ].map((item) => (
            <View key={item.title} style={styles.generalCard}>
              <Text style={styles.generalIcon}>{item.icon}</Text>
              <Text style={styles.generalTitle}>{item.title}</Text>
              <Text style={styles.generalSub}>{item.sub}</Text>
            </View>
          ))}
        </View>
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
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + 20,
    paddingBottom: spacing.lg,
  },
  heroLabel: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  guides: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadowSmall,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  accentBar: {
    height: 3,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "600",
    marginTop: 2,
  },
  overview: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  sectionPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    backgroundColor: colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  generalSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  generalCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  generalCard: {
    width: "48%" as unknown as number,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minWidth: 150,
    flexGrow: 1,
  },
  generalIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  generalTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
    marginBottom: 2,
  },
  generalSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
