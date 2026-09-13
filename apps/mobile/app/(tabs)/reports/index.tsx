import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDepartmentPerformance, useReportSummary, useReportTrend } from "../../../src/api/hooks/useReports";
import { AppText } from "../../../src/components/AppText";
import { Card } from "../../../src/components/Card";
import { DeptBarChart } from "../../../src/components/DeptBarChart";
import { KpiCard } from "../../../src/components/KpiCard";
import { LineChart } from "../../../src/components/LineChart";
import { Screen } from "../../../src/components/Screen";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/typography";
import { weekdayAr } from "../../../src/utils/format";

const PERIODS = [
  { key: "7d", label: "آخر 7 أيام", days: 7 },
  { key: "30d", label: "آخر 30 يوم", days: 30 },
  { key: "90d", label: "آخر 90 يوم", days: 90 },
];

export default function ReportsScreen() {
  const [period, setPeriod] = useState("30d");
  const [pickerOpen, setPickerOpen] = useState(false);
  const summary = useReportSummary(period);
  const departments = useDepartmentPerformance(period);
  const trend = useReportTrend(period);
  const current = PERIODS.find((p) => p.key === period)!;

  return (
    <Screen title="التقارير والتحليلات" showBack>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.period} onPress={() => setPickerOpen(true)}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <AppText weight="medium" size={13}>
            {current.label}
          </AppText>
        </Pressable>

        <View style={styles.kpiRow}>
          <KpiCard
            labelOnTop
            tone="info"
            label="الطلبات المكتملة"
            value={String(summary.data?.closedCount ?? 0)}
            deltaPct={summary.data?.closedDeltaPct ?? 0}
            deltaGood={(summary.data?.closedDeltaPct ?? 0) >= 0}
          />
          <KpiCard
            labelOnTop
            tone="success"
            label="نسبة الالتزام بـ SLA"
            value={`${Math.round(summary.data?.slaCompliancePct ?? 0)}%`}
            deltaPct={summary.data?.slaComplianceDeltaPct ?? 0}
            deltaGood={(summary.data?.slaComplianceDeltaPct ?? 0) >= 0}
          />
          <KpiCard
            labelOnTop
            tone="info"
            label="متوسط زمن الرد"
            value={String(summary.data?.avgResponseHours ?? 0)}
            unit="ساعة"
            deltaPct={summary.data?.avgResponseDeltaPct ?? 0}
            deltaGood={(summary.data?.avgResponseDeltaPct ?? 0) <= 0}
          />
        </View>

        <Card style={styles.section}>
          <AppText weight="bold" size={16}>
            أداء الإدارات
          </AppText>
          {departments.data?.length ? (
            <DeptBarChart data={departments.data} />
          ) : (
            <AppText size={13} color={colors.textSecondary} align="center">
              لا توجد بيانات كافية لهذه الفترة
            </AppText>
          )}
        </Card>

        <Card style={styles.section}>
          <AppText weight="bold" size={15}>{`اتجاهات الاستجابة خلال ${current.days} يوم`}</AppText>
          <LineChart
            unitSuffix="h"
            values={(trend.data ?? []).map((p) => p.avgResponseHours)}
            labels={(trend.data ?? []).map((p) => (current.days <= 7 ? weekdayAr(p.date) : p.date.slice(5).replace("-", "/")))}
          />
        </Card>
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.sheet}>
            {PERIODS.map((p) => (
              <Pressable
                key={p.key}
                style={styles.option}
                onPress={() => {
                  setPeriod(p.key);
                  setPickerOpen(false);
                }}
              >
                {p.key === period ? <Ionicons name="checkmark" size={18} color={colors.accent} /> : <View style={{ width: 18 }} />}
                <AppText weight={p.key === period ? "bold" : "regular"} size={15}>
                  {p.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  period: {
    alignSelf: "flex-start",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  kpiRow: { flexDirection: "row-reverse", gap: spacing.sm },
  section: { gap: spacing.lg },
  backdrop: { flex: 1, backgroundColor: "rgba(6,56,75,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  option: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
