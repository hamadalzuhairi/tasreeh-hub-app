import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { REQUEST_TYPE_LABELS_AR, type RequestType } from "@tasreeh/shared";
import { useNewRequestWizard } from "../../../../src/requests/NewRequestWizardContext";
import { AppText } from "../../../../src/components/AppText";
import { Button } from "../../../../src/components/Button";
import { Screen } from "../../../../src/components/Screen";
import { TextField } from "../../../../src/components/TextField";
import { WizardSteps } from "../../../../src/components/WizardSteps";
import { colors } from "../../../../src/theme/colors";
import { spacing } from "../../../../src/theme/typography";

const TYPES: RequestType[] = ["statement", "inquiry", "interview", "other"];
const MAX = 2000;

export default function NewRequestStep1() {
  const router = useRouter();
  const wizard = useNewRequestWizard();
  const [text, setText] = useState(wizard.state.body);

  const canContinue = !!wizard.state.type && text.trim().length >= 10;

  async function pickAttachment() {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (!result.canceled && result.assets?.[0]) {
      wizard.setAttachmentName(result.assets[0].name);
    }
  }

  function handleNext() {
    const trimmed = text.trim();
    const firstLine = trimmed.split("\n")[0];
    wizard.setSubject(firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine);
    wizard.setBody(trimmed);
    router.push("/(tabs)/requests/new/step-2");
  }

  return (
    <Screen title="طلب تصريح جديد" showBack titleIcon="document-text-outline">
      <WizardSteps current={1} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <AppText weight="bold" size={15}>
            نوع الطلب
          </AppText>
          <View style={styles.types}>
            {TYPES.map((type) => {
              const selected = wizard.state.type === type;
              return (
                <Pressable key={type} onPress={() => wizard.setType(type)} style={[styles.typeBox, selected && styles.typeBoxSelected]}>
                  <AppText weight={selected ? "bold" : "medium"} size={14} color={selected ? colors.accent : colors.textSecondary} align="center">
                    {REQUEST_TYPE_LABELS_AR[type]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TextField
          label="موضوع الطلب"
          required
          value={text}
          onChangeText={setText}
          placeholder="اكتب تفاصيل طلبك هنا..."
          multiline
          maxLength={MAX}
          showCounter
        />

        <View style={styles.field}>
          <AppText weight="bold" size={15}>
            مرفقات (اختياري)
          </AppText>
          <Pressable style={styles.dropzone} onPress={pickAttachment}>
            <Ionicons name="cloud-upload-outline" size={30} color={colors.primary} />
            {wizard.state.attachmentName ? (
              <AppText weight="bold" size={14} color={colors.accent} align="center">
                {wizard.state.attachmentName}
              </AppText>
            ) : (
              <AppText size={14} color={colors.textPrimary} align="center">
                اسحب الملفات هنا أو <AppText weight="bold" size={14} color={colors.accent}>اختر من جهازك</AppText>
              </AppText>
            )}
            <View style={styles.hint}>
              <AppText size={11} color={colors.textMuted} align="center">
                الحد الأقصى 10 ميجابايت · PDF, DOC, DOCX, JPG, PNG
              </AppText>
              <Ionicons name="information-circle-outline" size={13} color={colors.textMuted} />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="التالي" icon="arrow-back" onPress={handleNext} disabled={!canContinue} style={styles.footerButton} />
        <Button label="إلغاء" variant="outline" onPress={() => router.back()} style={styles.footerButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl },
  field: { gap: spacing.md },
  types: { flexDirection: "row-reverse", gap: spacing.sm },
  typeBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBoxSelected: { borderColor: colors.accent, borderWidth: 1.5, backgroundColor: colors.accentLight },
  dropzone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C9D5DE",
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  hint: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
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
