import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDepartments } from "../../../../src/api/hooks/useDepartments";
import { AppText } from "../../../../src/components/AppText";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { Screen } from "../../../../src/components/Screen";
import { WizardSteps } from "../../../../src/components/WizardSteps";
import { colors } from "../../../../src/theme/colors";
import { spacing } from "../../../../src/theme/typography";

export default function NewRequestStep2() {
  const router = useRouter();
  const departments = useDepartments();

  return (
    <Screen title="طلب تصريح جديد" showBack titleIcon="document-text-outline">
      <WizardSteps current={2} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.smart}>
          <View style={styles.smartIcon}>
            <Ionicons name="sparkles" size={22} color={colors.textInverse} />
          </View>
          <View style={styles.smartText}>
            <AppText weight="bold" size={15} color={colors.accent}>
              توجيه آلي ذكي
            </AppText>
            <AppText size={13} color={colors.textPrimary} style={styles.lh}>
              يحلل النظام محتوى طلبك ويوجهه تلقائياً إلى المتحدث الرسمي أو الجهة المختصة الأنسب، دون الحاجة لاختيارها يدوياً.
            </AppText>
          </View>
        </View>

        <AppText weight="bold" size={15}>
          الجهات المتاحة للتوجيه
        </AppText>
        <Card style={styles.list}>
          {(departments.data ?? []).map((dept, index) => (
            <View key={dept.id} style={[styles.deptRow, index > 0 && styles.divider]}>
              <View style={styles.deptIcon}>
                <Ionicons name="business-outline" size={18} color={colors.info} />
              </View>
              <AppText weight="medium" size={14} style={{ flex: 1 }}>
                {dept.nameAr}
              </AppText>
            </View>
          ))}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="التالي" icon="arrow-back" onPress={() => router.push("/(tabs)/requests/new/step-3")} style={styles.footerButton} />
        <Button label="رجوع" variant="outline" onPress={() => router.back()} style={styles.footerButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  smart: {
    flexDirection: "row-reverse",
    gap: spacing.md,
    backgroundColor: colors.accentLight,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: "flex-start",
  },
  smartIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  smartText: { flex: 1, alignItems: "flex-end", gap: 4 },
  lh: { lineHeight: 21 },
  list: { paddingVertical: spacing.xs },
  deptRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  deptIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.infoLight, alignItems: "center", justifyContent: "center" },
  footer: {
    flexDirection: "row-reverse",
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },
});
