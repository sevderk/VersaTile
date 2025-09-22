export type Theme = {
  name: "light" | "dark";
  bg: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentMuted: string;
  success: string;
  error: string;
  line: string;
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;
  disabled: string;
};

// Light — Blue Serenity (aynı kaldı)
export const LightTheme: Theme = {
  name: "light",
  bg: "#EDF2FB",
  bgElevated: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  accent: "#ABC4FF",
  accentMuted: "#D7E3FC",
  success: "#7AD1B8",
  error: "#F3B0B0",
  line: "rgba(2,6,23,0.08)",
  inputBg: "#FFFFFF",
  inputBorder: "rgba(2,6,23,0.12)",
  inputPlaceholder: "#94A3B8",
  disabled: "rgba(2,6,23,0.30)",
};

// Dark — daha yüksek kontrast / daha koyu vurgu
export const DarkTheme: Theme = {
  name: "dark",
  bg: "#0E141F",
  bgElevated: "#121A2A",
  textPrimary: "#E6EBFF",
  textSecondary: "#AAB7D0",
  accent: "#9BB0FF",
  accentMuted: "rgba(110,130,255,0.18)",
  success: "#64D1B4",
  error: "#F49AA9",
  line: "rgba(255,255,255,0.10)",
  inputBg: "#101826",
  inputBorder: "rgba(255,255,255,0.14)",
  inputPlaceholder: "#93A2BE",
  disabled: "rgba(255,255,255,0.35)",
};
