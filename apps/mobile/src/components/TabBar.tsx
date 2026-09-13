import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

// Minimal slice of React Navigation's BottomTabBarProps (the package isn't a direct dependency).
export interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}
import { AppText } from "./AppText";

const TABS: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }> = {
  home: { label: "الرئيسية", icon: "home-outline", activeIcon: "home" },
  requests: { label: "الطلبات", icon: "clipboard-outline", activeIcon: "clipboard" },
  archive: { label: "الأرشيف", icon: "archive-outline", activeIcon: "archive" },
  reports: { label: "التقارير", icon: "bar-chart-outline", activeIcon: "bar-chart" },
  more: { label: "المزيد", icon: "grid-outline", activeIcon: "grid" },
};

// Rendered right-to-left so الرئيسية sits on the right, matching the mockup.
export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const tint = focused ? colors.accent : colors.textMuted;

        return (
          <Pressable
            key={route.key}
            style={styles.item}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            <Ionicons name={focused ? tab.activeIcon : tab.icon} size={23} color={tint} />
            <AppText weight={focused ? "bold" : "regular"} size={11} color={tint} align="center">
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row-reverse",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
});
