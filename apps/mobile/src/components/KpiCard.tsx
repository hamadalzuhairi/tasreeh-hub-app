import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { Card } from "./Card";
import { AppText } from "./AppText";

export type KpiTone = "danger" | "success" | "info";

const TONES: Record<KpiTone, { fg: string; bg: string }> = {
  danger: { fg: colors.danger, bg: colors.dangerLight },
  success: { fg: colors.success, bg: colors.successLight },
  info: { fg: colors.info, bg: colors.infoLight },
};

interface KpiCardProps {
  value: string;
  unit?: string;
  label: string;
  tone: KpiTone;
  icon?: keyof typeof Ionicons.glyphMap; // home variant shows an icon badge on top
  deltaPct?: number;
  deltaGood?: boolean;
  labelOnTop?: boolean; // reports variant: label above the value, no icon
}

function formatDelta(pct: number) {
  const rounded = Math.round(pct);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function KpiCard({ value, unit, label, tone, icon, deltaPct, deltaGood, labelOnTop }: KpiCardProps) {
  const t = TONES[tone];
  const deltaColor = deltaGood === undefined ? t.fg : deltaGood ? colors.success : colors.danger;
  const align = labelOnTop ? "right" : "center";

  const labelNode = (
    <AppText size={12} color={labelOnTop ? colors.textPrimary : colors.textSecondary} align={align} numberOfLines={1}>
      {label}
    </AppText>
  );

  return (
    <Card style={[styles.card, labelOnTop && styles.cardStart]}>
      {icon ? (
        <View style={[styles.iconBadge, { backgroundColor: t.bg }]}>
          <Ionicons name={icon} size={20} color={t.fg} />
        </View>
      ) : null}
      {labelOnTop ? labelNode : null}
      <View style={[styles.valueRow, labelOnTop && styles.valueRowStart]}>
        <AppText weight="bold" size={labelOnTop ? 28 : 24} color={t.fg} align={align}>
          {value}
        </AppText>
        {unit ? (
          <AppText weight="medium" size={13} color={t.fg} align={align}>
            {unit}
          </AppText>
        ) : null}
      </View>
      {labelOnTop ? null : labelNode}
      {deltaPct !== undefined ? (
        <AppText weight="bold" size={13} color={deltaColor} align={labelOnTop ? "right" : align} direction="ltr">
          {formatDelta(deltaPct)}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 14 },
  cardStart: { alignItems: "stretch" },
  iconBadge: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  valueRow: { flexDirection: "row-reverse", alignItems: "baseline", gap: 4, justifyContent: "center" },
  valueRowStart: { justifyContent: "flex-start" },
});
