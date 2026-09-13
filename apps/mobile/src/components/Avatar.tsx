import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { AppText } from "./AppText";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  onPress?: () => void;
  editable?: boolean; // shows a small camera badge
}

function initials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  // Skip the Arabic definite article so "ماجد الغامدي" gives "م غ", not "م ا".
  return parts
    .slice(0, 2)
    .map((p) => (p.startsWith("ال") && p.length > 2 ? p.charAt(2) : p.charAt(0)))
    .join(" ");
}

export function Avatar({ uri, name, size = 48, onPress, editable }: AvatarProps) {
  const content = (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : name ? (
        <AppText weight="bold" size={size * 0.34} color={colors.primary} align="center">
          {initials(name)}
        </AppText>
      ) : (
        <Ionicons name="person" size={size * 0.55} color={colors.primary} />
      )}
      {editable ? (
        <View style={[styles.badge, { right: -2, bottom: -2 }]}>
          <Ionicons name="camera" size={13} color={colors.textInverse} />
        </View>
      ) : null}
    </View>
  );

  return onPress ? (
    <Pressable onPress={onPress} hitSlop={6}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: "#DCE7EC",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
