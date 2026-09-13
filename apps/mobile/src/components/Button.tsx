import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { AppText } from "./AppText";

type Variant = "primary" | "outline" | "danger" | "dangerOutline" | "ghost";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.accent, fg: colors.textInverse, border: colors.accent },
  outline: { bg: colors.surface, fg: colors.textPrimary, border: colors.border },
  danger: { bg: colors.danger, fg: colors.textInverse, border: colors.danger },
  dangerOutline: { bg: colors.surface, fg: colors.danger, border: "#F3B8BA" },
  ghost: { bg: "transparent", fg: colors.accent, border: "transparent" },
};

export function Button({ label, onPress, variant = "primary", icon, loading, disabled, style }: ButtonProps) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.content}>
          <AppText weight="bold" size={15} color={v.fg} align="center">
            {label}
          </AppText>
          {icon ? <Ionicons name={icon} size={18} color={v.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  content: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
