import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useArchive } from "../../../src/api/hooks/useArchive";
import { AppText } from "../../../src/components/AppText";
import { ArchiveItemCard } from "../../../src/components/ArchiveItemCard";
import { ChipGroup } from "../../../src/components/ChipGroup";
import { Screen } from "../../../src/components/Screen";
import { SearchBar } from "../../../src/components/SearchBar";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/typography";

type TabKey = "statement" | "interview" | "inquiry";

export default function ArchiveSearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();
  const [query, setQuery] = useState(params.q ?? "");
  const [submitted, setSubmitted] = useState(params.q ?? "");
  const [tab, setTab] = useState<TabKey>("statement");

  const results = useArchive({ q: submitted || undefined });

  const counts = useMemo(() => {
    const data = results.data ?? [];
    return {
      statement: data.filter((r) => r.type === "statement").length,
      interview: data.filter((r) => r.type === "interview").length,
      inquiry: data.filter((r) => r.type === "inquiry").length,
    };
  }, [results.data]);

  const visible = (results.data ?? []).filter((r) => r.type === tab);

  return (
    <Screen title="نتائج البحث" showBack>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.controls}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="ابحث..."
              onSubmit={() => setSubmitted(query.trim())}
              filterInside
              onFilterPress={() => {
                setQuery("");
                setSubmitted("");
              }}
            />
            <ChipGroup
              value={tab}
              onChange={setTab}
              options={[
                { key: "statement", label: `التصريحات (${counts.statement})` },
                { key: "interview", label: `المقابلات (${counts.interview})` },
                { key: "inquiry", label: `الأسئلة المتكررة (${counts.inquiry})` },
              ]}
            />
          </View>
        }
        renderItem={({ item }) => (
          <ArchiveItemCard item={item} showBadge={false} onPress={() => router.push(`/(tabs)/requests/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          results.isLoading ? null : (
            <AppText size={14} color={colors.textSecondary} align="center" style={styles.empty}>
              لا توجد نتائج مطابقة
            </AppText>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  controls: { gap: spacing.lg, marginBottom: spacing.lg },
  empty: { paddingVertical: spacing.xxl },
});
