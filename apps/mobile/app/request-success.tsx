import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../src/components/AppText";
import { Button } from "../src/components/Button";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/typography";

export default function RequestSuccessScreen() {
  const { requestNumber } = useLocalSearchParams<{ requestNumber: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <StatusBar style="light" />
      <View style={[styles.sheet, { marginBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.illustration}>
          <View style={styles.bigCheck}>
            <Ionicons name="checkmark" size={46} color={colors.textInverse} />
          </View>
          <View style={styles.doc}>
            <View style={[styles.docLine, { width: 70 }]} />
            <View style={[styles.docLine, { width: 90 }]} />
            <View style={[styles.docLine, { width: 56 }]} />
            <View style={styles.smallCheck}>
              <Ionicons name="checkmark" size={20} color={colors.textInverse} />
            </View>
          </View>
        </View>

        <AppText weight="bold" size={22} color={colors.accentDark} align="center">
          تم إرسال الطلب بنجاح
        </AppText>
        <AppText size={15} color={colors.textSecondary} align="center">
          رقم الطلب الخاص بك هو
        </AppText>
        <AppText weight="bold" size={40} color={colors.accentDark} align="center">{`#${requestNumber}`}</AppText>
        <AppText size={14} color={colors.textSecondary} align="center">
          سيتم إشعارك بأي تحديث عبر التطبيق.
        </AppText>

        <Button label="العودة إلى قائمة الطلبات" onPress={() => router.replace("/(tabs)/requests")} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.accentDark, paddingHorizontal: spacing.md },
  sheet: {
    flex: 1,
    backgroundColor: "#EEF8F5",
    borderRadius: 26,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    gap: spacing.md,
  },
  illustration: { alignItems: "center", marginBottom: spacing.lg },
  bigCheck: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  doc: {
    marginTop: -10,
    width: 140,
    height: 100,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 10,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  docLine: { height: 6, borderRadius: 3, backgroundColor: "#D7E2E8" },
  smallCheck: {
    position: "absolute",
    left: -18,
    bottom: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentDark,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  button: { marginTop: spacing.xl },
});
