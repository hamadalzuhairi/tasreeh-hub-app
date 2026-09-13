import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { REQUEST_TYPE_LABELS_AR } from "@tasreeh/shared";
import { useNewRequestWizard } from "../../../../src/requests/NewRequestWizardContext";
import { useCreateRequest } from "../../../../src/api/hooks/useRequests";
import { ApiError } from "../../../../src/api/client";
import { AppText } from "../../../../src/components/AppText";
import { Button } from "../../../../src/components/Button";
import { Card } from "../../../../src/components/Card";
import { Screen } from "../../../../src/components/Screen";
import { WizardSteps } from "../../../../src/components/WizardSteps";
import { colors } from "../../../../src/theme/colors";
import { spacing } from "../../../../src/theme/typography";

export default function NewRequestStep3() {
  const router = useRouter();
  const wizard = useNewRequestWizard();
  const createRequest = useCreateRequest();
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!wizard.state.type) return;
    setError(null);
    try {
      const created = await createRequest.mutateAsync({
        type: wizard.state.type,
        subject: wizard.state.subject,
        body: wizard.state.body,
      });
      wizard.reset();
      router.replace({ pathname: "/request-success", params: { requestNumber: String(created.requestNumber) } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذر إرسال الطلب، حاول مرة أخرى");
    }
  }

  return (
    <Screen title="طلب تصريح جديد" showBack titleIcon="document-text-outline">
      <WizardSteps current={3} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Row label="نوع الطلب" value={wizard.state.type ? REQUEST_TYPE_LABELS_AR[wizard.state.type] : "—"} />
          <Row label="الجهة" value="يتم تحديدها آلياً عند الإرسال" icon="sparkles-outline" />
          <Row label="موضوع الطلب" value={wizard.state.body} />
          {wizard.state.attachmentName ? <Row label="المرفقات" value={wizard.state.attachmentName} icon="attach-outline" /> : null}
        </Card>
        {error ? (
          <AppText size={13} color={colors.danger} align="center">
            {error}
          </AppText>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="إرسال الطلب" icon="send" onPress={handleSend} loading={createRequest.isPending} style={styles.footerButton} />
        <Button label="رجوع" variant="outline" onPress={() => router.back()} style={styles.footerButton} />
      </View>
    </Screen>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.row}>
      <AppText size={12} color={colors.textSecondary}>
        {label}
      </AppText>
      <View style={styles.inline}>
        <AppText weight="bold" size={15} style={styles.value}>
          {value}
        </AppText>
        {icon ? <Ionicons name={icon} size={15} color={colors.accent} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  card: { gap: spacing.lg },
  row: { gap: 4, alignItems: "flex-end" },
  inline: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  value: { flexShrink: 1, lineHeight: 22 },
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
