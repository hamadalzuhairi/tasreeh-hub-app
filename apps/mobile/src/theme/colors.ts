// Palette sampled from docs/mockup-reference.png.
export const colors = {
  primary: "#06384B",
  primaryDark: "#042A38",
  accent: "#0B7A64",
  accentDark: "#086352",
  accentLight: "#E3F4EF",

  background: "#F3F6F8",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF2F5",
  sheet: "#F7F9FB",

  textPrimary: "#0E2F44",
  textSecondary: "#6B7C8A",
  textMuted: "#9AA8B4",
  textInverse: "#FFFFFF",

  border: "#E4EAEF",

  danger: "#E0393E",
  dangerLight: "#FDECEC",
  dangerSurface: "#FDF1F1",
  success: "#17905F",
  successLight: "#E3F5EC",
  info: "#1F5FAF",
  infoLight: "#E6EFFA",
  warning: "#B7791F",
  warningLight: "#FDF3E1",
  neutral: "#5E6E7B",
  neutralLight: "#EAEFF3",
} as const;

export type ColorToken = keyof typeof colors;
