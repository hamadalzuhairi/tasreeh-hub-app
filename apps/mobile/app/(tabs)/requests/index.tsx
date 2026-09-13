import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { REQUEST_TYPE_LABELS_AR, type RequestType } from "@tasreeh/shared";
import { useRequests } from "../../../src/api/hooks/useRequests";
import { AppText } from "../../../src/components/AppText";
import { ChipGroup } from "../../../src/components/ChipGroup";
import { RequestCard } from "../../../src/components/RequestCard";
import { Screen } from "../../../src/components/Screen";
import { SearchBar } from "../../../src/components/SearchBar";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/typography";

type TabKey = "all" | "in_progress" | "closed";
type TypeFilter = "all" | RequestType;

export default function MyRequestsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const all = useRequests();

  const counts = useMemo(() => {
    const data = all.data ?? [];
    return {
      all: data.length,
      in_progress: data.filter((r) => r.status !== "closed").length,
      closed: data.filter((r) => r.status === "closed").length,
    };
  }, [all.data]);

  const filtered = useMemo(() => {
    const term = search.trim();
    return (all.data ?? []).filter((r) => {
      if (tab === "in_progress" && r.status === "closed") return false;
      if (tab === "closed" && r.status !== "closed") return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (term && !r.subject.includes(term) && !String(r.requestNumber).includes(term.replace("#", ""))) return false;
      return true;
    });
  }, [all.data, tab, typeFilter, search]);

  return (
    <Screen title="طلباتي" leftIcon="add-circle-outline" onLeftPress={() => router.push("/(tabs)/requests/new/step-1")}>
      <View style={styles.controls}>
        <View style={styles.segment}>
          <ChipGroup
            stretch
            value={tab}
            onChange={setTab}
            options={[
              { key: "all", label: `الكل (${counts.all})` },
              { key: "in_progress", label: `قيد المعالجة (${counts.in_progress})` },
              { key: "closed", label: `مغلقة (${counts.closed})` },
            ]}
          />
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="البحث برقم الطلب أو الموضوع..."
          onFilterPress={() => setShowFilters((v) => !v)}
        />
        {showFilters ? (
          <ChipGroup
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { key: "all", label: "كل الأنواع" },
              ...(Object.keys(REQUEST_TYPE_LABELS_AR) as RequestType[]).map((t) => ({ key: t, label: REQUEST_TYPE_LABELS_AR[t] })),
            ]}
          />
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RequestCard request={item} onPress={() => router.push(`/(tabs)/requests/${item.id}`)} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          all.isLoading ? null : (
            <AppText size={14} color={colors.textSecondary} align="center" style={styles.empty}>
              لا توجد طلبات مطابقة
            </AppText>
          )
        }
        refreshing={all.isRefetching}
        onRefresh={() => all.refetch()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.md },
  segment: { backgroundColor: colors.surface, borderRadius: 14, padding: 5, borderWidth: 1, borderColor: colors.border },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  empty: { paddingVertical: spacing.xxl },
});
