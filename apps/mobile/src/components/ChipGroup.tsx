import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { AppText } from "./AppText";

interface ChipGroupProps<T extends string> {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  stretch?: boolean; // equal-width segments (طلباتي tabs) instead of content-width scrolling chips
}

export function ChipGroup<T extends string>({ options, value, onChange, stretch }: ChipGroupProps<T>) {
  const scrollRef = useRef<ScrollView>(null);

  const chips = options.map((option) => {
    const selected = option.key === value;
    return (
      <Pressable
        key={option.key}
        onPress={() => onChange(option.key)}
        style={[styles.chip, stretch && styles.chipStretch, selected ? styles.selected : styles.unselected]}
      >
        <AppText
          weight={selected ? "bold" : "medium"}
          size={13}
          color={selected ? colors.textInverse : colors.textSecondary}
          align="center"
          numberOfLines={1}
        >
          {option.label}
        </AppText>
      </Pressable>
    );
  });

  if (stretch) {
    return <View style={styles.rowReverse}>{chips}</View>;
  }

  // Horizontal ScrollViews start at x=0, so a row-reverse strip would clip its first chip off the
  // right edge. Lay the chips out reversed left-to-right and jump to the end instead.
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      contentContainerStyle={styles.scrollRow}
    >
      {[...chips].reverse()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rowReverse: { flexDirection: "row-reverse", gap: spacing.sm },
  scrollRow: { flexDirection: "row", gap: spacing.sm, flexGrow: 1, justifyContent: "flex-end" },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  chipStretch: { flex: 1, paddingHorizontal: 6 },
  selected: { backgroundColor: colors.accent },
  unselected: { backgroundColor: colors.surfaceAlt },
});
