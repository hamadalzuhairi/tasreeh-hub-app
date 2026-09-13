import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { AppText } from "./AppText";

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (key: T) => void;
}

export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);

  return (
    <View style={styles.wrapper}>
      <AppText size={12} color={colors.textSecondary}>
        {label}
      </AppText>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <AppText weight="medium" size={14} numberOfLines={1} style={styles.value}>
          {selected?.label ?? ""}
        </AppText>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <AppText weight="bold" size={16} style={styles.sheetTitle}>
              {label}
            </AppText>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.key}
                  style={styles.option}
                  onPress={() => {
                    onChange(option.key);
                    setOpen(false);
                  }}
                >
                  {option.key === value ? <Ionicons name="checkmark" size={18} color={colors.accent} /> : <View style={{ width: 18 }} />}
                  <AppText weight={option.key === value ? "bold" : "regular"} size={15}>
                    {option.label}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, gap: 6 },
  field: {
    height: 46,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  value: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(6,56,75,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: "60%",
  },
  sheetTitle: { marginBottom: spacing.md },
  option: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
