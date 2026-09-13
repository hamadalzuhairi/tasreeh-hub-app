import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { REQUEST_TYPE_LABELS_AR } from "@tasreeh/shared";
import { useEscalateRequest, useRequest } from "../src/api/hooks/useRequest";
import { AppText } from "../src/components/AppText";
import { Button } from "../src/components/Button";
import { TextField } from "../src/components/TextField";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/typography";
import { formatDateTime, formatDays } from "../src/utils/format";

export default function EscalationAlertScreen() {
  const { id, requestNumber } = useLocalSearchParams<{ id: string; requestNumber: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const request = useRequest(id);
  const escalate = useEscalateRequest(id ?? "");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const data = request.data;
  const slaDays = data ? Math.max(1, Math.round((new Date(data.slaDueAt).getTime() - new Date(data.createdAt).getTime()) / 86_400_000)) : 0;
  const lateDays = data ? Math.max(0, Math.ceil((Date.now() - new Date(data.slaDueAt).getTime()) / 86_400_000)) : 0;

  async function handleEscalate() {
    await escalate.mutateAsync({ reason: note || undefined });
    router.back();
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <StatusBar style="dark" />
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
        <Ionicons name="close" size={28} color={colors.primary} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.halo}>
          <View style={styles.bell}>
            <Ionicons name="alarm" size={40} color={colors.textInverse} />
          </View>
        </View>
        <AppText weight="bold" size={26} color={colors.danger} align="center">
          طلب متأخر
        </AppText>
        <AppText weight="medium" size={15} align="center" style={styles.lead}>
          {`الطلب #${requestNumber} لم يتم الرد عليه خلال المدة المحددة (${formatDays(slaDays)})`}
        </AppText>

        {data ? (
          <View style={styles.details}>
            <Line label="الجهة:" value={data.department?.nameAr ?? "—"} />
            <Line label="نوع الطلب:" value={REQUEST_TYPE_LABELS_AR[data.type]} />
            <Line label="تاريخ التقديم:" value={formatDateTime(data.createdAt)} />
            <Line label="المدة المتأخرة:" value={lateDays > 0 ? formatDays(lateDays) : "أقل من يوم"} danger />
          </View>
        ) : null}

        {showNote ? <TextField placeholder="أضف ملاحظة للمشرف..." value={note} onChangeText={setNote} multiline /> : null}
      </ScrollView>

      <View style={styles.actions}>
        <Button label="تصعيد إلى المشرف الأعلى" icon="arrow-up" variant="danger" loading={escalate.isPending} onPress={handleEscalate} />
        <Button label={showNote ? "إخفاء الملاحظة" : "إضافة ملاحظة"} variant="dangerOutline" onPress={() => setShowNote((v) => !v)} />
      </View>
    </View>
  );
}

function Line({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={styles.line}>
      <AppText weight="medium" size={15} color={colors.textPrimary}>
        {label}
      </AppText>
      <AppText weight={danger ? "bold" : "regular"} size={15} color={danger ? colors.danger : colors.textPrimary}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dangerSurface, paddingHorizontal: spacing.xl },
  close: { alignSelf: "flex-start" },
  content: { alignItems: "center", gap: spacing.md, paddingTop: spacing.xl },
  halo: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(224,57,62,0.12)", alignItems: "center", justifyContent: "center" },
  bell: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.danger, alignItems: "center", justifyContent: "center" },
  lead: { lineHeight: 26, maxWidth: 320 },
  details: { alignSelf: "stretch", gap: spacing.md, marginTop: spacing.lg, paddingHorizontal: spacing.md },
  line: { flexDirection: "row-reverse", gap: spacing.sm, flexWrap: "wrap" },
  actions: { gap: spacing.md },
});
