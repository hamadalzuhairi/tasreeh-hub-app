import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import { AppText } from "./AppText";

export type PillTone = "success" | "danger" | "info" | "neutral" | "accent" | "warning";

const TONES: Record<PillTone, { bg: string; fg: string }> = {
  success: { bg: colors.successLight, fg: colors.success },
  danger: { bg: colors.dangerLight, fg: colors.danger },
  info: { bg: colors.infoLight, fg: colors.info },
  neutral: { bg: colors.neutralLight, fg: colors.neutral },
  accent: { bg: colors.accentLight, fg: colors.accent },
  warning: { bg: colors.warningLight, fg: colors.warning },
};

export function Pill({ label, tone, size = "md" }: { label: string; tone: PillTone; size?: "sm" | "md" }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, size === "sm" && styles.pillSm, { backgroundColor: t.bg }]}>
      <AppText weight="medium" size={size === "sm" ? 11 : 12} color={t.fg} align="center">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingVertical: 4, paddingHorizontal: 14, borderRadius: 999, alignSelf: "flex-start" },
  pillSm: { paddingVertical: 2, paddingHorizontal: 10 },
});
