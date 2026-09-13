import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/auth/AuthContext";
import { TabBar, type TabBarProps } from "../../src/components/TabBar";
import { colors } from "../../src/theme/colors";

export const unstable_settings = { initialRouteName: "home" };

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...(props as unknown as TabBarProps)} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="requests" />
      <Tabs.Screen name="archive" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
