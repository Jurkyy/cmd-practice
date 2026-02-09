import { Platform } from "react-native";

export const colors = {
  // Core backgrounds
  background: "#080d1a",
  surface: "#111827",
  surfaceElevated: "#1a2236",
  surfaceLight: "#243049",
  glass: "rgba(255,255,255,0.04)",
  glassHover: "rgba(255,255,255,0.08)",

  // Brand
  primary: "#6366f1",
  primaryLight: "#818cf8",
  primaryDark: "#4f46e5",
  primaryGlow: "rgba(99,102,241,0.15)",
  accent: "#06b6d4",
  accentGlow: "rgba(6,182,212,0.15)",

  // Semantic
  success: "#34d399",
  successBg: "rgba(52,211,153,0.12)",
  error: "#f87171",
  errorBg: "rgba(248,113,113,0.12)",
  warning: "#fbbf24",
  warningBg: "rgba(251,191,36,0.12)",

  // Text
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  textDim: "#475569",

  // Borders
  border: "#1e293b",
  borderLight: "#334155",
  borderAccent: "#6366f133",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

export const shadowSmall = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
  default: {},
});
