import React from "react";
import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { Resource, RESOURCE_TYPE_CONFIG } from "../types";
import { colors, spacing, borderRadius, fontSize } from "../utils/theme";

interface Props {
  resource: Resource;
  compact?: boolean;
}

export function ResourceLink({ resource, compact }: Props) {
  const config = RESOURCE_TYPE_CONFIG[resource.type];

  return (
    <Pressable
      style={({ pressed }) => [
        compact ? styles.containerCompact : styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => Linking.openURL(resource.url)}
    >
      <View style={[styles.iconWrap, { backgroundColor: config.color + "20" }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
          {resource.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.typeLabel, { color: config.color }]}>
            {config.label}
          </Text>
          {resource.free && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>Free</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.arrow}>{"\u203A"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  containerCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  typeLabel: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  freeBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  freeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  arrow: {
    color: colors.textDim,
    fontSize: 22,
    fontWeight: "300",
  },
});
