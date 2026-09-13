import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  filterInside?: boolean; // filter icon inside the field (search results) vs a separate square button
}

export function SearchBar({ value, onChangeText, placeholder, onSubmit, onFilterPress, filterInside }: SearchBarProps) {
  const webProps = { dir: "rtl" } as Record<string, string>;
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          {...webProps}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          style={styles.input}
        />
        {filterInside && onFilterPress ? (
          <Pressable onPress={onFilterPress} hitSlop={8}>
            <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {!filterInside && onFilterPress ? (
        <Pressable style={styles.filterButton} onPress={onFilterPress}>
          <Ionicons name="funnel-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", gap: spacing.sm },
  field: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    height: "100%",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
