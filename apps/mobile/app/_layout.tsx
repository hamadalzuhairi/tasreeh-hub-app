import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../src/auth/AuthContext";
import { useAppFonts } from "../src/theme/typography";
import { ensureLayoutDirection } from "../src/theme/rtl";
import { colors } from "../src/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

ensureLayoutDirection();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="request-success" options={{ presentation: "modal" }} />
          <Stack.Screen name="escalation-alert" options={{ presentation: "modal" }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
