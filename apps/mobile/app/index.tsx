import { ActivityIndicator, Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../src/auth/AuthContext";
import { AppText } from "../src/components/AppText";
import { Button } from "../src/components/Button";
import { LogoMark } from "../src/components/Logo";
import { STATUS_BAR_MIN } from "../src/components/Screen";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/typography";

// Skyline cropped from the mockup's splash (docs/mockup-reference.png), 227×180 source ratio.
const CITY = require("../assets/splash-city.jpg");
const CITY_RATIO = 180 / 227;
const HAZE = "#F3EADE"; // top row of the photo
const GROUND = "#415261"; // bottom row of the photo

export default function SplashScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const size = useWindowDimensions();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  const cityTop = size.height * 0.425;
  const cityHeight = size.width * CITY_RATIO;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient colors={["#C7DBE8", "#E4ECF0", HAZE]} locations={[0, 0.25, 0.45]} style={StyleSheet.absoluteFill} />

      {size.width > 0 ? (
        <>
          <LinearGradient
            colors={[GROUND, "#6D7E8A", "#C4CDD3"]}
            locations={[0, 0.55, 1]}
            style={[styles.abs, { top: cityTop + cityHeight - 2, bottom: 0 }]}
          />
          <Image source={CITY} resizeMode="cover" style={[styles.abs, { top: cityTop, height: cityHeight }]} />
          <LinearGradient
            colors={[HAZE, "rgba(243,234,222,0)"]}
            style={[styles.abs, { top: cityTop - 1, height: cityHeight * 0.28 }]}
          />
        </>
      ) : null}

      <View style={[styles.hero, { paddingTop: Math.max(insets.top, STATUS_BAR_MIN) + 36 }]}>
        <LogoMark size={68} />
        <AppText weight="bold" size={54} color={colors.primary} align="center" style={styles.wordmark}>
          تصريح
        </AppText>
        <AppText weight="bold" size={24} color={colors.primary} align="center" direction="ltr">
          Tasreeh Hub
        </AppText>
        <AppText weight="medium" size={15} color={colors.primary} align="center" style={styles.tagline}>
          بوابة رقمية موحدة لتنظيم التواصل بين الإعلاميين والمتحدثين الرسميين الحكوميين
        </AppText>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button label="تسجيل الدخول" onPress={() => router.push("/login")} style={styles.primaryShadow} />
        <Button label="إنشاء حساب جديد" variant="outline" onPress={() => router.push("/signup")} style={styles.secondary} />
        <View style={styles.nafath}>
          <AppText weight="bold" size={13} color={colors.primary} align="center">
            بوابة المصادقة الوطنية
          </AppText>
          <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  root: { flex: 1, backgroundColor: HAZE, overflow: "hidden" },
  abs: { position: "absolute", left: 0, right: 0, width: "100%" },
  hero: { alignItems: "center", paddingHorizontal: spacing.xl },
  wordmark: { marginTop: spacing.md, lineHeight: 72 },
  tagline: { marginTop: spacing.lg, lineHeight: 26, maxWidth: 310 },
  actions: { marginTop: "auto", paddingHorizontal: spacing.xl, gap: spacing.md },
  primaryShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  secondary: { backgroundColor: "rgba(255,255,255,0.94)", borderColor: "rgba(255,255,255,0.94)" },
  nafath: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xs,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
});
