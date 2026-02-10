import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSubscription, FREE_LIMITS } from "../src/hooks/useSubscription";
import { colors, spacing, fontSize, borderRadius, shadow } from "../src/utils/theme";

const FEATURES = [
  {
    icon: "\uD83D\uDCDA",
    title: "Full Question Bank",
    free: `${FREE_LIMITS.totalQuestions} questions`,
    pro: "200+ questions & growing",
  },
  {
    icon: "\uD83C\uDFE2",
    title: "Company-Tagged Questions",
    free: "\u2717",
    pro: "Filter by Jane Street, Citadel, etc.",
  },
  {
    icon: "\uD83D\uDD01",
    title: "Spaced Repetition",
    free: "\u2717",
    pro: "SM-2 algorithm, review queue",
  },
  {
    icon: "\uD83D\uDCCA",
    title: "Advanced Analytics",
    free: "Basic stats",
    pro: "Tag analytics, weak spots, trends",
  },
  {
    icon: "\uD83E\uDDEE",
    title: "Mental Math Drills",
    free: `${FREE_LIMITS.mentalMathSessions} sessions`,
    pro: "Unlimited drills + history",
  },
  {
    icon: "\uD83D\uDEE4\uFE0F",
    title: "Learning Paths",
    free: "1 path",
    pro: "All curated paths",
  },
  {
    icon: "\uD83D\uDCCB",
    title: "Detailed Explanations",
    free: "\u2717",
    pro: "Step-by-step + common mistakes",
  },
  {
    icon: "\uD83C\uDFC6",
    title: "Achievements & Streaks",
    free: "Basic",
    pro: "Full gamification",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { startTrial, trialDaysLeft, trialActive, isPro } = useSubscription();

  const handleStartTrial = async () => {
    await startTrial();
    router.back();
  };

  // If already pro, show confirmation
  if (isPro) {
    return (
      <View style={styles.container}>
        <View style={styles.proContent}>
          <Text style={styles.proEmoji}>{"\u2705"}</Text>
          <Text style={styles.proTitle}>You're on Pro!</Text>
          {trialActive && trialDaysLeft > 0 && (
            <Text style={styles.proSub}>
              Trial: {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to App</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{"\uD83D\uDE80"}</Text>
        <Text style={styles.headerTitle}>Unlock Quant Practice Pro</Text>
        <Text style={styles.headerSub}>
          Everything you need to ace your quant interview
        </Text>
      </View>

      {/* Feature comparison */}
      <View style={styles.comparisonCard}>
        {/* Column headers */}
        <View style={styles.compRow}>
          <View style={styles.compFeature} />
          <View style={styles.compFreeCol}>
            <Text style={styles.compHeader}>Free</Text>
          </View>
          <View style={styles.compProCol}>
            <Text style={styles.compHeaderPro}>Pro</Text>
          </View>
        </View>

        {FEATURES.map((f) => (
          <View key={f.title} style={styles.compRow}>
            <View style={styles.compFeature}>
              <Text style={styles.compIcon}>{f.icon}</Text>
              <Text style={styles.compTitle}>{f.title}</Text>
            </View>
            <View style={styles.compFreeCol}>
              <Text style={[
                styles.compValue,
                f.free === "\u2717" && styles.compValueNo,
              ]}>
                {f.free}
              </Text>
            </View>
            <View style={styles.compProCol}>
              <Text style={styles.compValuePro}>{f.pro}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pricing */}
      <View style={styles.pricingSection}>
        <Pressable
          style={({ pressed }) => [styles.annualCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={handleStartTrial}
        >
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>SAVE 58%</Text>
          </View>
          <Text style={styles.planName}>Annual</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$49.99</Text>
            <Text style={styles.priceUnit}>/year</Text>
          </View>
          <Text style={styles.priceBreakdown}>$4.17/month</Text>
          <View style={styles.trialBadge}>
            <Text style={styles.trialBadgeText}>7-day free trial</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.monthlyCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={handleStartTrial}
        >
          <Text style={styles.planName}>Monthly</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceMonthly}>$9.99</Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
          <View style={styles.trialBadge}>
            <Text style={styles.trialBadgeText}>7-day free trial</Text>
          </View>
        </Pressable>
      </View>

      {/* Social proof */}
      <View style={styles.socialProof}>
        <Text style={styles.socialText}>
          Join thousands preparing for Jane Street, Citadel, Two Sigma and more
        </Text>
      </View>

      {/* Restore + Terms */}
      <View style={styles.footer}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.footerLink}>Continue with Free</Text>
        </Pressable>
        <Pressable>
          <Text style={styles.footerLink}>Restore Purchases</Text>
        </Pressable>
        <Text style={styles.footerLegal}>
          Payment will be charged to your App Store account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 40,
  },

  // Pro state
  proContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  proEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  proTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  proSub: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  backButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },

  // Header
  header: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  headerSub: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
  },

  // Comparison table
  comparisonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadow,
  },
  compRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  compFeature: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  compIcon: {
    fontSize: 16,
  },
  compTitle: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: "600",
    flex: 1,
  },
  compFreeCol: {
    flex: 1,
    alignItems: "center",
  },
  compProCol: {
    flex: 1.5,
    alignItems: "center",
  },
  compHeader: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  compHeaderPro: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  compValue: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  compValueNo: {
    color: colors.error,
    fontSize: 14,
  },
  compValuePro: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  // Pricing
  pricingSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  annualCard: {
    backgroundColor: colors.primaryGlow,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    position: "relative",
  },
  saveBadge: {
    position: "absolute",
    top: -10,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  saveBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  planName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  price: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "900",
    letterSpacing: -1,
  },
  priceMonthly: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  priceUnit: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  priceBreakdown: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  trialBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  trialBadgeText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  monthlyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Social proof
  socialProof: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  socialText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    fontStyle: "italic",
  },

  // Footer
  footer: {
    alignItems: "center",
    gap: spacing.md,
  },
  footerLink: {
    color: colors.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  footerLegal: {
    color: colors.textDim,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: spacing.md,
  },
});
