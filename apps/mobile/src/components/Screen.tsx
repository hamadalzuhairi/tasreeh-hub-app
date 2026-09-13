import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { AppText } from "./AppText";

// Measured from docs/mockup-reference.png (scaled to a 375pt-wide phone): status-bar area ~47pt,
// title row centred at ~70pt, content sheet starting at ~101pt with rounded top corners.
export const STATUS_BAR_MIN = 47;
export const TITLE_ROW_HEIGHT = 46;
const SHEET_OVERLAP = 20;
const HEADER_BOTTOM_PADDING = 8 + SHEET_OVERLAP;

interface ScreenProps {
  title?: string;
  showBack?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  titleIcon?: keyof typeof Ionicons.glyphMap;
  header?: ReactNode; // fully custom header content (home screen)
  children: ReactNode;
}

export function Screen({ title, showBack, leftIcon, onLeftPress, titleIcon, header, children }: ScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, STATUS_BAR_MIN) }]}>
        {header ?? (
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              {titleIcon ? <Ionicons name={titleIcon} size={20} color={colors.textInverse} /> : null}
              <AppText weight="bold" size={19} color={colors.textInverse}>
                {title}
              </AppText>
            </View>
            {showBack ? (
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Ionicons name="chevron-back" size={24} color={colors.textInverse} />
              </Pressable>
            ) : leftIcon ? (
              <Pressable onPress={onLeftPress} hitSlop={12}>
                <Ionicons name={leftIcon} size={22} color={colors.textInverse} />
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
      <View style={styles.sheet}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  header: { paddingHorizontal: spacing.xl, paddingBottom: HEADER_BOTTOM_PADDING },
  titleRow: {
    height: TITLE_ROW_HEIGHT,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  sheet: {
    flex: 1,
    marginTop: -SHEET_OVERLAP,
    backgroundColor: colors.sheet,
    borderTopLeftRadius: SHEET_OVERLAP,
    borderTopRightRadius: SHEET_OVERLAP,
    overflow: "hidden",
  },
});
