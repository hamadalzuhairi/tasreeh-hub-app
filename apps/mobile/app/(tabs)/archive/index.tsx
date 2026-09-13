import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { REQUEST_TYPE_LABELS_AR, type RequestType } from "@tasreeh/shared";
import { useArchive, type ArchiveContentFilter } from "../../../src/api/hooks/useArchive";
import { useDepartments } from "../../../src/api/hooks/useDepartments";
import { AppText } from "../../../src/components/AppText";
import { ArchiveItemCard } from "../../../src/components/ArchiveItemCard";
import { ChipGroup } from "../../../src/components/ChipGroup";
import { Screen } from "../../../src/components/Screen";
import { SearchBar } from "../../../src/components/SearchBar";
import { SelectField } from "../../../src/components/SelectField";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/typography";

const THIS_YEAR = new Date().getFullYear();
const YEARS = ["all", String(THIS_YEAR), String(THIS_YEAR - 1), String(THIS_YEAR - 2)];

export default function ArchiveScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ArchiveContentFilter>("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [year, setYear] = useState("all");
  const departments = useDepartments();

  const archive = useArchive({
    filter,
    departmentId: departmentId === "all" ? undefined : departmentId,
    year: year === "all" ? undefined : year,
  });

  const header = (
    <View style={styles.controls}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="ابحث في التصريحات والمقابلات..."
        onSubmit={() => search.trim() && router.push({ pathname: "/(tabs)/archive/search", params: { q: search.trim() } })}
      />
      <ChipGroup
        value={filter === "other" ? "all" : filter}
        onChange={setFilter}
        options={[
          { key: "all", label: "جميع المحتويات" },
          { key: "statement", label: "تصريحات" },
          { key: "interview", label: "مقابلات" },
          { key: "inquiry", label: "أسئلة متكررة" },
        ]}
      />
      <View style={styles.selects}>
        <SelectField
          label="الجهة"
          value={departmentId}
          onChange={setDepartmentId}
          options={[{ key: "all", label: "كل الجهات" }, ...(departments.data ?? []).map((d) => ({ key: d.id, label: d.nameAr }))]}
        />
        <SelectField label="السنة" value={year} onChange={setYear} options={YEARS.map((y) => ({ key: y, label: y === "all" ? "الكل" : y }))} />
        <SelectField
          label="نوع المحتوى"
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "الكل" },
            ...(Object.keys(REQUEST_TYPE_LABELS_AR) as RequestType[]).map((t) => ({ key: t, label: REQUEST_TYPE_LABELS_AR[t] })),
          ]}
        />
      </View>
    </View>
  );

  return (
    <Screen title="الأرشيف" showBack>
      <FlatList
        data={archive.data ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ArchiveItemCard item={item} onPress={() => router.push(`/(tabs)/requests/${item.id}`)} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          archive.isLoading ? null : (
            <AppText size={14} color={colors.textSecondary} align="center" style={styles.empty}>
              لا توجد نتائج في الأرشيف
            </AppText>
          )
        }
        refreshing={archive.isRefetching}
        onRefresh={() => archive.refetch()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  controls: { gap: spacing.lg, marginBottom: spacing.lg },
  selects: { flexDirection: "row-reverse", gap: spacing.sm },
  empty: { paddingVertical: spacing.xxl },
});
