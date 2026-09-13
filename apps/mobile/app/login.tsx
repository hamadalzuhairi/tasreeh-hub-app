import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { ApiError } from "../src/api/client";
import { AppText } from "../src/components/AppText";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { LogoMark } from "../src/components/Logo";
import { Screen } from "../src/components/Screen";
import { TextField } from "../src/components/TextField";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/typography";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("journalist@tasreeh.sa");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/(tabs)/home");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="تسجيل الدخول" showBack>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logoHalo}>
              <LogoMark size={82} />
            </View>
            <AppText weight="bold" size={40} color={colors.primary} align="center" style={styles.wordmark}>
              تصريح
            </AppText>
            <AppText weight="bold" size={17} color={colors.primary} align="center" direction="ltr">
              Tasreeh Hub
            </AppText>
            <AppText size={14} color={colors.textSecondary} align="center" style={styles.welcome}>
              مرحباً بك، سجّل دخولك لمتابعة طلباتك وتصريحاتك
            </AppText>
          </View>

          <Card style={styles.form}>
            <TextField
              label="البريد الإلكتروني"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextField label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={handleLogin} />
            {error ? (
              <AppText size={13} color={colors.danger} align="center">
                {error}
              </AppText>
            ) : null}
            <Button label="تسجيل الدخول" onPress={handleLogin} loading={loading} disabled={!email || !password} />
          </Card>

          <Button label="ليس لديك حساب؟ إنشاء حساب جديد" variant="ghost" onPress={() => router.replace("/signup")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg },
  brand: { alignItems: "center", paddingTop: spacing.lg, paddingBottom: spacing.sm },
  logoHalo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  wordmark: { marginTop: spacing.md, lineHeight: 52 },
  welcome: { marginTop: spacing.sm },
  form: { gap: spacing.lg },
});
