import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "../theme/colors";
import { fonts, spacing } from "../theme/typography";
import { AppText } from "./AppText";

interface TextFieldProps extends TextInputProps {
  label?: string;
  required?: boolean;
  showCounter?: boolean;
}

export function TextField({ label, required, showCounter, maxLength, value, multiline, style, ...rest }: TextFieldProps) {
  const webProps = { dir: "rtl" } as Record<string, string>;
  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText weight="bold" size={15}>
            {label}
          </AppText>
          {required ? (
            <AppText weight="bold" size={15} color={colors.danger}>
              *
            </AppText>
          ) : null}
        </View>
      ) : null}
      <TextInput
        {...webProps}
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline && styles.multiline, style]}
        {...rest}
      />
      {showCounter && maxLength ? (
        <AppText size={12} color={colors.textMuted} align="left">
          {`${value?.length ?? 0}/${maxLength}`}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  labelRow: { flexDirection: "row-reverse", gap: 4 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    minHeight: 50,
  },
  multiline: { minHeight: 130, textAlignVertical: "top" },
});
