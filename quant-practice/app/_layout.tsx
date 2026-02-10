import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/utils/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="quiz/[category]"
          options={{ title: "Quiz", presentation: "card" }}
        />
        <Stack.Screen
          name="quiz/results"
          options={{
            title: "Results",
            presentation: "card",
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="learn/[category]"
          options={{ title: "Study Guide", presentation: "card" }}
        />
        <Stack.Screen
          name="learn/path/[id]"
          options={{ title: "Learning Path", presentation: "card" }}
        />
        <Stack.Screen
          name="drill"
          options={{ title: "Mental Math", presentation: "card", headerShown: false }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            title: "Upgrade",
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "Settings", presentation: "card" }}
        />
      </Stack>
    </>
  );
}
