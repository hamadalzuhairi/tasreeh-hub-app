import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { REQUEST_TYPE_LABELS_AR, type MediaRequest, type RequestType } from "@tasreeh/shared";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { formatDateTime } from "../utils/format";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { Pill, type PillTone } from "./Pill";

export const TYPE_TONE: Record<RequestType, PillTone> = {
  statement: "success",
  interview: "info",
  inquiry: "info",
  other: "neutral",
};

export function statusPillFor(request: MediaRequest): { label: string; tone: PillTone } {
  if (request.status === "closed") return { label: "مغلق", tone: "neutral" };
  if (request.priority === "urgent") return { label: "عاجل", tone: "danger" };
  return { label: "عادي", tone: "success" };
}

export function RequestCard({ request, onPress }: { request: MediaRequest; onPress?: () => void }) {
  const status = statusPillFor(request);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Pill label={REQUEST_TYPE_LABELS_AR[request.type]} tone={TYPE_TONE[request.type]} size="sm" />
          <AppText weight="bold" size={14} color={colors.accent}>{`#${request.requestNumber}`}</AppText>
        </View>
        <AppText weight="bold" size={15} numberOfLines={2}>
          {request.subject}
        </AppText>
        <AppText size={12} color={colors.textSecondary}>
          {request.department?.nameAr ?? "قيد التوجيه"}
        </AppText>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <AppText size={12} color={colors.textSecondary}>
            {formatDateTime(request.createdAt)}
          </AppText>
        </View>
      </View>
      <View style={styles.side}>
        <Pill label={status.label} tone={status.tone} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row-reverse", paddingVertical: spacing.md },
  body: { flex: 1, gap: 6, alignItems: "flex-end" },
  topRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  dateRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginTop: 2 },
  side: { justifyContent: "center", paddingTop: spacing.lg },
});
