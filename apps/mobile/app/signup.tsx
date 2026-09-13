import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { ApiError } from "../src/api/client";
import { AppText } from "../src/components/AppText";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { Screen } from "../src/components/Screen";
import { TextField } from "../src/components/TextField";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/typography";

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length >= 2 && email.includes("@") && password.length >= 8;

  async function handleSignup() {
    setError(null);
    setLoading(true);
    try {
      await signup({ name, email, password, organization: organization || undefined, phone: phone || undefined });
      router.replace("/(tabs)/home");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="إنشاء حساب جديد" showBack>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card style={styles.form}>
            <TextField label="الاسم الكامل" value={name} onChangeText={setName} />
            <TextField label="البريد الإلكتروني" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextField label="جهة العمل (اختياري)" value={organization} onChangeText={setOrganization} />
            <TextField label="رقم الجوال (اختياري)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextField label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry placeholder="8 أحرف على الأقل" />
            {error ? (
              <AppText size={13} color={colors.danger} align="center">
                {error}
              </AppText>
            ) : null}
            <Button label="إنشاء الحساب" onPress={handleSignup} loading={loading} disabled={!canSubmit} />
          </Card>
          <Button label="لديك حساب؟ تسجيل الدخول" variant="ghost" onPress={() => router.replace("/login")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  form: { gap: spacing.lg },
});
