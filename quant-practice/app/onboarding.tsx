import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, fontSize, borderRadius, shadow } from "../src/utils/theme";

const { width } = Dimensions.get("window");

const ROLES = [
  { id: "trading", label: "Quant Trading", icon: "\uD83D\uDCC8" },
  { id: "research", label: "Quant Research", icon: "\uD83D\uDD2C" },
  { id: "risk", label: "Risk / Quant Dev", icon: "\uD83D\uDEE1\uFE0F" },
  { id: "general", label: "General Prep", icon: "\uD83C\uDF93" },
];

const FIRMS = [
  { id: "jane-street", label: "Jane Street" },
  { id: "citadel", label: "Citadel" },
  { id: "two-sigma", label: "Two Sigma" },
  { id: "de-shaw", label: "D.E. Shaw" },
  { id: "jump-trading", label: "Jump Trading" },
  { id: "hudson-river", label: "Hudson River" },
  { id: "optiver", label: "Optiver" },
  { id: "imc", label: "IMC" },
  { id: "sig", label: "SIG" },
  { id: "other", label: "Other" },
];

const TIMELINES = [
  { id: "1-week", label: "< 1 week", icon: "\u26A1", sub: "Crash course" },
  { id: "1-month", label: "1 month", icon: "\uD83D\uDCC5", sub: "Focused prep" },
  { id: "3-months", label: "3+ months", icon: "\uD83C\uDFAF", sub: "Deep mastery" },
];

const ONBOARDING_KEY = "quant-practice-onboarding";

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [firms, setFirms] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string | null>(null);

  const toggleFirm = (id: string) => {
    setFirms((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleComplete = useCallback(async () => {
    // Save onboarding data
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    await AsyncStorage.setItem(
      "quant-practice-profile",
      JSON.stringify({ role, firms, timeline })
    );
    router.replace("/");
  }, [role, firms, timeline, router]);

  const canProceed =
    step === 0 ? !!role :
    step === 1 ? firms.length > 0 :
    step === 2 ? !!timeline :
    true;

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]}
          />
        ))}
      </View>

      {/* Step 0: Role */}
      {step === 0 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepEmoji}>{"\uD83C\uDFAF"}</Text>
          <Text style={styles.stepTitle}>What are you preparing for?</Text>
          <Text style={styles.stepSub}>
            We'll tailor your practice experience
          </Text>
          <View style={styles.optionsGrid}>
            {ROLES.map((r) => (
              <Pressable
                key={r.id}
                style={[styles.roleCard, role === r.id && styles.roleCardSelected]}
                onPress={() => setRole(r.id)}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text style={[styles.roleLabel, role === r.id && styles.roleLabelSelected]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Step 1: Firms */}
      {step === 1 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepEmoji}>{"\uD83C\uDFE2"}</Text>
          <Text style={styles.stepTitle}>Target firms?</Text>
          <Text style={styles.stepSub}>
            Select all that apply — we'll prioritize relevant questions
          </Text>
          <View style={styles.firmsGrid}>
            {FIRMS.map((f) => {
              const selected = firms.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  style={[styles.firmChip, selected && styles.firmChipSelected]}
                  onPress={() => toggleFirm(f.id)}
                >
                  <Text style={[styles.firmLabel, selected && styles.firmLabelSelected]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Step 2: Timeline */}
      {step === 2 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepEmoji}>{"\u23F0"}</Text>
          <Text style={styles.stepTitle}>How much time do you have?</Text>
          <Text style={styles.stepSub}>
            We'll adjust the intensity of your study plan
          </Text>
          <View style={styles.timelineOptions}>
            {TIMELINES.map((t) => (
              <Pressable
                key={t.id}
                style={[
                  styles.timelineCard,
                  timeline === t.id && styles.timelineCardSelected,
                ]}
                onPress={() => setTimeline(t.id)}
              >
                <Text style={styles.timelineIcon}>{t.icon}</Text>
                <View>
                  <Text
                    style={[
                      styles.timelineLabel,
                      timeline === t.id && styles.timelineLabelSelected,
                    ]}
                  >
                    {t.label}
                  </Text>
                  <Text style={styles.timelineSub}>{t.sub}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Step 3: Ready */}
      {step === 3 && (
        <View style={styles.stepContent}>
          <Text style={styles.readyEmoji}>{"\uD83D\uDE80"}</Text>
          <Text style={styles.readyTitle}>You're all set!</Text>
          <Text style={styles.readySub}>
            Your personalized study plan is ready. Start practicing and track your progress as you go.
          </Text>
          <View style={styles.readySummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Role</Text>
              <Text style={styles.summaryValue}>
                {ROLES.find((r) => r.id === role)?.label ?? ""}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Firms</Text>
              <Text style={styles.summaryValue}>
                {firms.length > 3
                  ? `${firms.slice(0, 3).map((f) => FIRMS.find((fi) => fi.id === f)?.label).join(", ")}...`
                  : firms.map((f) => FIRMS.find((fi) => fi.id === f)?.label).join(", ")}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Timeline</Text>
              <Text style={styles.summaryValue}>
                {TIMELINES.find((t) => t.id === timeline)?.label ?? ""}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom buttons */}
      <View style={styles.bottomBar}>
        {step > 0 && (
          <Pressable style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            !canProceed && styles.nextBtnDisabled,
            pressed && canProceed && styles.nextBtnPressed,
            step === 0 && { flex: 1 },
          ]}
          onPress={() => {
            if (!canProceed) return;
            if (step === 3) {
              handleComplete();
            } else {
              setStep((s) => s + 1);
            }
          }}
          disabled={!canProceed}
        >
          <Text style={[styles.nextBtnText, !canProceed && styles.nextBtnTextDisabled]}>
            {step === 3 ? "Start Practicing" : "Continue"}
          </Text>
        </Pressable>
      </View>

      {/* Skip */}
      {step < 3 && (
        <Pressable style={styles.skipBtn} onPress={handleComplete}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xxl + 20,
    paddingHorizontal: spacing.lg,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotDone: {
    backgroundColor: colors.primaryLight,
  },
  stepContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  stepTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  stepSub: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
  },
  roleCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2 - 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleCardSelected: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  roleLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "700",
    textAlign: "center",
  },
  roleLabelSelected: {
    color: colors.primaryLight,
  },
  firmsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  firmChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  firmChipSelected: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  firmLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  firmLabelSelected: {
    color: colors.primaryLight,
  },
  timelineOptions: {
    width: "100%",
    gap: spacing.md,
  },
  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  timelineCardSelected: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  timelineIcon: {
    fontSize: 28,
  },
  timelineLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  timelineLabelSelected: {
    color: colors.primaryLight,
  },
  timelineSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  readyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  readyTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  readySub: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  readySummary: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  summaryValue: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  bottomBar: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    justifyContent: "center",
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  nextBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextBtnDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  nextBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  nextBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "800",
  },
  nextBtnTextDisabled: {
    color: colors.textDim,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  skipText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
});
