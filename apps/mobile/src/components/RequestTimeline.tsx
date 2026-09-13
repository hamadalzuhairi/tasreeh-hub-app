import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RequestStatus, TimelineEvent, TimelineEventType } from "@tasreeh/shared";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { formatDateTime } from "../utils/format";
import { AppText } from "./AppText";

const STEPS: { type: TimelineEventType; label: string }[] = [
  { type: "submitted", label: "تم التقديم" },
  { type: "routed", label: "تم التوجيه للجهة" },
  { type: "in_progress", label: "قيد المعالجة" },
  { type: "awaiting_reply", label: "بانتظار الرد" },
  { type: "closed", label: "تم الإغلاق" },
];

const ORDER: RequestStatus[] = ["submitted", "routed", "in_progress", "awaiting_reply", "closed"];

// Fixed lifecycle, completed steps checked, the current step highlighted, future steps greyed.
export function RequestTimeline({ status, events }: { status: RequestStatus; events: TimelineEvent[] }) {
  const currentIndex = ORDER.indexOf(status);
  const visible = status === "closed" ? STEPS : STEPS.slice(0, 4);
  const escalation = events.find((e) => e.eventType === "escalated");

  return (
    <View>
      {visible.map((step, index) => {
        const event = events.find((e) => e.eventType === step.type);
        const done = index < currentIndex || (index === currentIndex && status === "closed");
        const current = index === currentIndex && status !== "closed";
        const isLast = index === visible.length - 1;

        return (
          <View key={step.type} style={styles.row}>
            <View style={styles.markerCol}>
              <View style={[styles.marker, done && styles.markerDone, current && styles.markerCurrent]}>
                {done ? (
                  <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                ) : current ? (
                  <Ionicons name="sync" size={13} color={colors.textInverse} />
                ) : (
                  <View style={styles.dot} />
                )}
              </View>
              {!isLast ? <View style={[styles.line, done && styles.lineDone]} /> : null}
            </View>
            <View style={styles.content}>
              <AppText
                weight={current ? "bold" : "medium"}
                size={14}
                color={current ? colors.accent : done ? colors.textPrimary : colors.textMuted}
              >
                {step.label}
              </AppText>
              {event && (done || current) ? (
                <AppText size={12} color={colors.textMuted}>
                  {formatDateTime(event.createdAt)}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
      {escalation ? (
        <View style={styles.escalation}>
          <Ionicons name="arrow-up-circle" size={16} color={colors.danger} />
          <AppText weight="medium" size={12} color={colors.danger}>
            {`تم تصعيد الطلب للمشرف الأعلى · ${formatDateTime(escalation.createdAt)}`}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const MARKER = 26;

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", gap: spacing.md },
  markerCol: { alignItems: "center", width: MARKER },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  markerDone: { backgroundColor: colors.accent },
  markerCurrent: { backgroundColor: colors.accent },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted },
  line: { flex: 1, width: 2, minHeight: 22, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.accent },
  content: { flex: 1, paddingBottom: spacing.lg, gap: 2, alignItems: "flex-end" },
  escalation: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.dangerLight,
    borderRadius: 10,
    padding: spacing.sm,
  },
});
