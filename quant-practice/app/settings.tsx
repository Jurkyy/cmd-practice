import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useNotifications } from "../src/hooks/useNotifications";
import { useSubscription } from "../src/hooks/useSubscription";
import { colors, spacing, fontSize, borderRadius } from "../src/utils/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, requestPermission, permissionGranted } =
    useNotifications();
  const { isPro, trialActive, trialDaysLeft, tier } = useSubscription();

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        if (Platform.OS !== "web") {
          Alert.alert(
            "Notifications Disabled",
            "Enable notifications in your device settings to receive reminders."
          );
        }
        return;
      }
    }
    await updateSettings({ enabled: value });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Subscription status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
        <Pressable
          style={({ pressed }) => [
            styles.subCard,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push("/paywall")}
        >
          <View style={styles.subInfo}>
            <Text style={styles.subTier}>
              {isPro ? "Pro" : "Free"}
            </Text>
            {trialActive && trialDaysLeft > 0 && (
              <Text style={styles.subTrial}>
                Trial: {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left
              </Text>
            )}
            {!isPro && (
              <Text style={styles.subUpgrade}>Tap to upgrade</Text>
            )}
          </View>
          <Text style={styles.subArrow}>{"\u203A"}</Text>
        </Pressable>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingSub}>Enable push notifications</Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        {settings.enabled && (
          <>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>
                  {"\uD83D\uDD25"} Streak Reminders
                </Text>
                <Text style={styles.settingSub}>
                  Daily reminder to maintain your streak
                </Text>
              </View>
              <Switch
                value={settings.streakReminder}
                onValueChange={(v) => updateSettings({ streakReminder: v })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>
                  {"\uD83D\uDD01"} Review Alerts
                </Text>
                <Text style={styles.settingSub}>
                  Alert when questions are due for review
                </Text>
              </View>
              <Switch
                value={settings.reviewReminder}
                onValueChange={(v) => updateSettings({ reviewReminder: v })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>
                  {"\uD83D\uDCCA"} Weekly Summary
                </Text>
                <Text style={styles.settingSub}>
                  Progress recap every Monday
                </Text>
              </View>
              <Switch
                value={settings.weeklySummary}
                onValueChange={(v) => updateSettings({ weeklySummary: v })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </>
        )}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <Pressable style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Privacy Policy</Text>
          <Text style={styles.aboutArrow}>{"\u203A"}</Text>
        </Pressable>
        <Pressable style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Terms of Service</Text>
          <Text style={styles.aboutArrow}>{"\u203A"}</Text>
        </Pressable>
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
    padding: spacing.md,
    paddingBottom: spacing.xxl + 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subInfo: {
    flex: 1,
  },
  subTier: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },
  subTrial: {
    color: colors.warning,
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginTop: 2,
  },
  subUpgrade: {
    color: colors.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginTop: 2,
  },
  subArrow: {
    color: colors.textDim,
    fontSize: 24,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  settingSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  aboutValue: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  aboutArrow: {
    color: colors.textDim,
    fontSize: 20,
  },
});
