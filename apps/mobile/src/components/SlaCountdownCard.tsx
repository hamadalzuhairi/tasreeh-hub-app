import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { formatDays } from "../utils/format";
import { AppText } from "./AppText";

function describe(hours: number) {
  if (hours >= 24) return formatDays(Math.floor(hours / 24));
  const h = Math.max(1, Math.floor(hours));
  return h === 1 ? "ساعة" : `${h} ساعة`;
}

export function SlaCountdownCard({ createdAt, slaDueAt }: { createdAt: string; slaDueAt: string }) {
  const remainingHours = (new Date(slaDueAt).getTime() - Date.now()) / 3_600_000;
  const totalHours = (new Date(slaDueAt).getTime() - new Date(createdAt).getTime()) / 3_600_000;
  const overdue = remainingHours <= 0;
  const tint = overdue ? colors.danger : colors.accent;

  return (
    <View style={[styles.card, { backgroundColor: overdue ? colors.dangerLight : colors.accentLight }]}>
      <View style={styles.text}>
        <AppText size={12} color={colors.textSecondary}>
          {overdue ? "تجاوز المدة المحددة للرد" : "المدة المتبقية للرد"}
        </AppText>
        <AppText weight="bold" size={28} color={tint}>
          {overdue ? `متأخر ${describe(-remainingHours)}` : describe(remainingHours)}
        </AppText>
        <AppText size={12} color={colors.textSecondary}>
          {`وفق معيار SLA (${describe(Math.round(totalHours))})`}
        </AppText>
      </View>
      <Ionicons name="time-outline" size={34} color={tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: spacing.lg,
  },
  text: { flex: 1, alignItems: "flex-end", gap: 2 },
});
