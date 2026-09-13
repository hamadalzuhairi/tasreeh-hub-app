import { useState } from "react";
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { REQUEST_TYPE_LABELS_AR, ROLE_LABELS_AR } from "@tasreeh/shared";
import { useAuth } from "../../src/auth/AuthContext";
import { useReportSummary, useReportTrend } from "../../src/api/hooks/useReports";
import { useRequests } from "../../src/api/hooks/useRequests";
import { AppText } from "../../src/components/AppText";
import { Card } from "../../src/components/Card";
import { KpiCard } from "../../src/components/KpiCard";
import { LineChart } from "../../src/components/LineChart";
import { LogoMark } from "../../src/components/Logo";
import { Pill } from "../../src/components/Pill";
import { statusPillFor } from "../../src/components/RequestCard";
import { Screen, TITLE_ROW_HEIGHT } from "../../src/components/Screen";
import { Avatar } from "../../src/components/Avatar";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/typography";
import { formatDate, weekdayAr } from "../../src/utils/format";

const COLUMNS = [
  { key: "number", label: "رقم الطلب", flex: 1 },
  { key: "type", label: "نوع الطلب", flex: 1 },
  { key: "dept", label: "الجهة", flex: 1.3 },
  { key: "status", label: "الحالة", flex: 1 },
  { key: "date", label: "التاريخ", flex: 1.2 },
];

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const summary = useReportSummary("7d");
  const trend = useReportTrend("7d");
  const requests = useRequests();
  const recent = (requests.data ?? []).slice(0, 5);

  const roleLabel = user ? ROLE_LABELS_AR[user.role] : "";
  const subtitle = user?.organization ? `${roleLabel} – ${user.organization}` : roleLabel;

  // Brand row centred at ~70pt and the name row at ~122pt, matching the mockup's home header.
  const header = (
    <View style={styles.headerContent}>
      <View style={styles.headerTop}>
        <View style={styles.brand}>
          <LogoMark size={30} />
          <View>
            <AppText weight="bold" size={22} color={colors.textInverse} style={styles.brandTitle}>
              تصريح
            </AppText>
            <AppText weight="medium" size={9} color={colors.textInverse} align="left" direction="ltr" style={styles.brandSub}>
              Tasreeh Hub
            </AppText>
          </View>
        </View>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Ionicons name="menu" size={28} color={colors.textInverse} />
        </Pressable>
      </View>
      <View style={styles.greetingRow}>
        <Avatar uri={user?.avatarUrl} name={user?.name} size={50} onPress={() => router.push("/(tabs)/more")} />
        <View style={styles.greetingText}>
          <AppText weight="bold" size={17} color={colors.textInverse} numberOfLines={1}>{`مرحباً، ${user?.name ?? ""}`}</AppText>
          <AppText size={13} color="#B9CCD4" numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
      </View>
    </View>
  );

  return (
    <Screen header={header}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={requests.isRefetching}
            onRefresh={() => {
              requests.refetch();
              summary.refetch();
              trend.refetch();
            }}
          />
        }
      >
        <View style={styles.kpiRow}>
          <KpiCard
            icon="alarm-outline"
            tone="danger"
            value={String(summary.data?.overdueCount ?? 0)}
            label="طلبات متأخرة"
            deltaPct={summary.data?.overdueDeltaPct ?? 0}
            deltaGood={false}
          />
          <KpiCard
            icon="speedometer-outline"
            tone="success"
            value={`${Math.round(summary.data?.slaCompliancePct ?? 0)}%`}
            label="الالتزام بـ SLA"
            deltaPct={summary.data?.slaComplianceDeltaPct ?? 0}
            deltaGood
          />
          <KpiCard
            icon="time-outline"
            tone="info"
            value={String(summary.data?.avgResponseHours ?? 0)}
            unit="ساعة"
            label="متوسط زمن الرد"
            deltaPct={summary.data?.avgResponseDeltaPct ?? 0}
            deltaGood={(summary.data?.avgResponseDeltaPct ?? 0) <= 0}
          />
        </View>

        <Card style={styles.section}>
          <AppText weight="bold" size={16}>
            أداء الاستجابة خلال آخر 7 أيام
          </AppText>
          <LineChart
            values={(trend.data ?? []).map((p) => p.avgResponseHours)}
            labels={(trend.data ?? []).map((p) => weekdayAr(p.date))}
          />
        </Card>

        <Card style={[styles.section, styles.tableCard]}>
          <AppText weight="bold" size={16} style={styles.tableTitle}>
            أحدث الطلبات
          </AppText>
          <View style={[styles.tableRow, styles.tableHead]}>
            {COLUMNS.map((c) => (
              <AppText key={c.key} size={11} color={colors.textMuted} align="center" style={{ flex: c.flex }}>
                {c.label}
              </AppText>
            ))}
          </View>
          {recent.map((r) => {
            const status = statusPillFor(r);
            return (
              <Pressable key={r.id} style={styles.tableRow} onPress={() => router.push(`/(tabs)/requests/${r.id}`)}>
                <AppText weight="bold" size={13} align="center" style={{ flex: 1 }}>{`#${r.requestNumber}`}</AppText>
                <AppText size={12} align="center" style={{ flex: 1 }}>
                  {REQUEST_TYPE_LABELS_AR[r.type]}
                </AppText>
                <AppText size={12} align="center" style={{ flex: 1.3 }} numberOfLines={2}>
                  {r.department?.nameAr ?? "—"}
                </AppText>
                <View style={[styles.cell, { flex: 1 }]}>
                  <Pill label={status.label} tone={status.tone} size="sm" />
                </View>
                <AppText size={11} color={colors.textSecondary} align="center" style={{ flex: 1.2 }}>
                  {formatDate(r.createdAt)}
                </AppText>
              </Pressable>
            );
          })}
          {recent.length === 0 && !requests.isLoading ? (
            <AppText size={13} color={colors.textSecondary} align="center" style={styles.empty}>
              لا توجد طلبات بعد
            </AppText>
          ) : null}
        </Card>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            {[
              { icon: "add-circle-outline" as const, label: "طلب تصريح جديد", onPress: () => router.push("/(tabs)/requests/new/step-1") },
              { icon: "notifications-outline" as const, label: "الإشعارات", onPress: () => router.push("/(tabs)/more/notifications") },
              { icon: "person-outline" as const, label: "الحساب الشخصي", onPress: () => router.push("/(tabs)/more") },
              { icon: "log-out-outline" as const, label: "تسجيل الخروج", onPress: logout },
            ].map((item) => (
              <Pressable
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  item.onPress();
                }}
              >
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <AppText weight="medium" size={15}>
                  {item.label}
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
  headerContent: { paddingBottom: 8 },
  headerTop: { height: TITLE_ROW_HEIGHT, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  brandTitle: { lineHeight: 26 },
  brandSub: { marginTop: -2, opacity: 0.85 },
  greetingRow: { height: 50, marginTop: 4, flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  greetingText: { flex: 1, alignItems: "flex-end", gap: 2 },
  content: { padding: spacing.lg, gap: spacing.lg },
  kpiRow: { flexDirection: "row-reverse", gap: spacing.sm },
  section: { gap: spacing.md },
  tableCard: { paddingHorizontal: 0, paddingBottom: spacing.sm },
  tableTitle: { paddingHorizontal: spacing.lg },
  tableRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableHead: { paddingVertical: spacing.sm, backgroundColor: colors.sheet },
  cell: { alignItems: "center" },
  empty: { paddingVertical: spacing.lg },
  backdrop: { flex: 1, backgroundColor: "rgba(6,56,75,0.3)" },
  menu: {
    position: "absolute",
    top: 70,
    left: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.xs,
    minWidth: 220,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  menuItem: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
});
