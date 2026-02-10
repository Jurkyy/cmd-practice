/**
 * Push notification infrastructure.
 *
 * To activate:
 * 1. Run: npx expo install expo-notifications expo-device expo-constants
 * 2. Add "expo-notifications" to plugins in app.json
 * 3. Uncomment the expo-notifications imports below
 * 4. Configure APNs (iOS) and FCM (Android) credentials
 *
 * For now, this module provides the scheduling logic and settings
 * management, with the actual notification calls stubbed.
 */

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Uncomment when expo-notifications is installed:
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";

const SETTINGS_KEY = "quant-practice-notification-settings";

export interface NotificationSettings {
  enabled: boolean;
  streakReminder: boolean; // Daily reminder to maintain streak
  reviewReminder: boolean; // Alert when review queue has items
  weeklySummary: boolean; // Weekly progress summary
  reminderHour: number; // 0-23, default 19 (7pm)
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  streakReminder: true,
  reviewReminder: true,
  weeklySummary: true,
  reminderHour: 19,
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load settings
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        }
      } catch {
        // ignore
      }
      setLoaded(true);
    })();
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Uncomment when expo-notifications is installed:
    // if (!Device.isDevice) return false;
    // const { status } = await Notifications.requestPermissionsAsync();
    // const granted = status === "granted";
    // setPermissionGranted(granted);
    // return granted;

    // Stub for development
    setPermissionGranted(true);
    return true;
  }, []);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

      // Reschedule notifications based on new settings
      await scheduleNotifications(newSettings);
    },
    [settings]
  );

  return {
    settings,
    permissionGranted,
    loaded,
    requestPermission,
    updateSettings,
  };
}

// Schedule local notifications based on settings
async function scheduleNotifications(settings: NotificationSettings) {
  // Uncomment when expo-notifications is installed:
  // await Notifications.cancelAllScheduledNotificationsAsync();
  //
  // if (!settings.enabled) return;
  //
  // if (settings.streakReminder) {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "Don't break your streak! 🔥",
  //       body: "Take a quick quiz to keep your streak going",
  //       sound: "default",
  //     },
  //     trigger: {
  //       type: "daily",
  //       hour: settings.reminderHour,
  //       minute: 0,
  //     },
  //   });
  // }
  //
  // if (settings.weeklySummary) {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "📊 Weekly Progress",
  //       body: "Check out your weekly progress summary",
  //       sound: "default",
  //     },
  //     trigger: {
  //       type: "weekly",
  //       weekday: 1, // Monday
  //       hour: 10,
  //       minute: 0,
  //     },
  //   });
  // }
}
