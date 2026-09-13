import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { REQUEST_STATUS_LABELS_AR, REQUEST_TYPE_LABELS_AR, type RequestStatus } from "@tasreeh/shared";
import { useAuth } from "../../../src/auth/AuthContext";
import { useRequest, useUpdateRequestStatus } from "../../../src/api/hooks/useRequest";
import { AppText } from "../../../src/components/AppText";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { Pill, type PillTone } from "../../../src/components/Pill";
import { RequestTimeline } from "../../../src/components/RequestTimeline";
import { Screen } from "../../../src/components/Screen";
import { SlaCountdownCard } from "../../../src/components/SlaCountdownCard";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/typography";
import { formatDateTime } from "../../../src/utils/format";

const STATUS_TONE: Record<RequestStatus, PillTone> = {
  submitted: "neutral",
  routed: "info",
  in_progress: "accent",
  awaiting_reply: "warning",
  closed: "neutral",
};

const NEXT_STATUS: Partial<Record<RequestStatus, { next: RequestStatus; label: string }>> = {
  routed: { next: "in_progress", label: "بدء المعالجة" },
  in_progress: { next: "awaiting_reply", label: "بانتظار الرد" },
  awaiting_reply: { next: "closed", label: "إغلاق الطلب" },
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const requestQuery = useRequest(id);
  const updateStatus = useUpdateRequestStatus(id ?? "");
  const [expanded, setExpanded] = useState(false);

  const request = requestQuery.data;

  return (
    <Screen title={request ? `تفاصيل الطلب #${request.requestNumber}` : "تفاصيل الطلب"} showBack>
      {requestQuery.isError ? (
        <View style={styles.loading}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <AppText weight="medium" size={15} align="center">
            {requestQuery.error instanceof Error ? requestQuery.error.message : "تعذر تحميل الطلب"}
          </AppText>
          <Button label="إعادة المحاولة" variant="outline" onPress={() => requestQuery.refetch()} />
        </View>
      ) : !request ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Pill label={REQUEST_STATUS_LABELS_AR[request.status]} tone={STATUS_TONE[request.status]} />

          <Card style={styles.info}>
            <Field label="نوع الطلب" value={REQUEST_TYPE_LABELS_AR[request.type]} />
            <Field label="الجهة" value={request.department?.nameAr ?? "قيد التوجيه"} icon="business-outline" />
            <View style={styles.inline}>
              <AppText weight="medium" size={14} color={colors.textPrimary}>
                {formatDateTime(request.createdAt)}
              </AppText>
              <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
            </View>
            <Field label="الموضوع" value={request.subject} />
          </Card>

          <AppText weight="bold" size={17}>
            مسار الطلب
          </AppText>
          <Card>
            <RequestTimeline status={request.status} events={request.timeline ?? []} />
          </Card>

          {request.status !== "closed" ? <SlaCountdownCard createdAt={request.createdAt} slaDueAt={request.slaDueAt} /> : null}

          {expanded ? (
            <Card style={styles.info}>
              <Field label="نص الطلب" value={request.body} />
              <Field label="الأولوية" value={request.priority === "urgent" ? "عاجل" : "عادي"} />
              {request.attachments?.length ? (
                <Field label="المرفقات" value={request.attachments.map((a) => a.fileName).join("، ")} />
              ) : null}
            </Card>
          ) : null}

          <Button label={expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"} onPress={() => setExpanded((v) => !v)} />

          {user?.role !== "journalist" && NEXT_STATUS[request.status] ? (
            <View style={styles.actions}>
              <Button
                variant="outline"
                label={NEXT_STATUS[request.status]!.label}
                loading={updateStatus.isPending}
                onPress={() => updateStatus.mutate({ status: NEXT_STATUS[request.status]!.next })}
              />
              <Button
                variant="dangerOutline"
                icon="arrow-up"
                label="تصعيد إلى المشرف الأعلى"
                onPress={() =>
                  router.push({ pathname: "/escalation-alert", params: { id: request.id, requestNumber: String(request.requestNumber) } })
                }
              />
            </View>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.field}>
      <AppText size={12} color={colors.textSecondary}>
        {label}
      </AppText>
      <View style={styles.inline}>
        <AppText weight="bold" size={15} style={styles.fieldValue}>
          {value}
        </AppText>
        {icon ? <Ionicons name={icon} size={15} color={colors.textSecondary} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  info: { gap: spacing.md },
  field: { gap: 4, alignItems: "flex-end" },
  fieldValue: { flexShrink: 1 },
  inline: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  actions: { gap: spacing.sm },
});
