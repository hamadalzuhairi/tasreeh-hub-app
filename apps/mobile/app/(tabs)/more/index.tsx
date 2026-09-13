import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ROLE_LABELS_AR, type User } from "@tasreeh/shared";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useAuth } from "../../../src/auth/AuthContext";
import { Avatar } from "../../../src/components/Avatar";
import { api } from "../../../src/api/client";
import { AppText } from "../../../src/components/AppText";
import { Button } from "../../../src/components/Button";
import { Card } from "../../../src/components/Card";
import { Screen } from "../../../src/components/Screen";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/typography";

export default function AccountScreen() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  if (!user) return null;

  async function changePhoto() {
    setPhotoError(null);
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (picked.canceled || !picked.assets?.[0]) return;

    setUploading(true);
    try {
      // Downscale before upload: the photo is stored inline as a data URI.
      const context = ImageManipulator.manipulate(picked.assets[0].uri);
      context.resize({ width: 256 });
      const rendered = await context.renderAsync();
      const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
      if (!saved.base64) throw new Error("تعذر تجهيز الصورة");
      await api.patch<User>("/api/auth/me", { avatarUrl: `data:image/jpeg;base64,${saved.base64}` });
      await refreshUser();
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "تعذر تحديث الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function toggleNafath() {
    setVerifying(true);
    // Mocked Nafath round trip for the MVP (see PATCH /api/auth/me).
    await new Promise((resolve) => setTimeout(resolve, 1200));
    try {
      await api.patch<User>("/api/auth/me", { nafathVerified: !user?.nafathVerified });
      await refreshUser();
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Screen title="الحساب الشخصي" titleIcon="settings-outline">
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profile}>
          <View style={styles.profileTop}>
            <View>
              <Avatar uri={user.avatarUrl} name={user.name} size={76} editable onPress={changePhoto} />
              {uploading ? (
                <View style={styles.avatarBusy}>
                  <ActivityIndicator color={colors.textInverse} />
                </View>
              ) : null}
            </View>
            <View style={styles.profileText}>
              <AppText weight="bold" size={18}>
                {user.name}
              </AppText>
              <AppText size={13} color={colors.textSecondary}>
                {ROLE_LABELS_AR[user.role]}
              </AppText>
              {user.organization ? (
                <AppText size={13} color={colors.textSecondary}>
                  {user.organization}
                </AppText>
              ) : null}
            </View>
          </View>
          {photoError ? (
            <AppText size={12} color={colors.danger} style={styles.photoError}>
              {photoError}
            </AppText>
          ) : null}
          <AppText size={14} color={colors.textPrimary} style={styles.contact} direction="ltr">
            {user.email}
          </AppText>
          {user.phone ? (
            <AppText size={14} color={colors.textPrimary} direction="ltr">
              {user.phone}
            </AppText>
          ) : null}
        </Card>

        <View style={styles.menu}>
          <Row icon="person-outline" label="الملف الشخصي" expanded={open === "profile"} onPress={() => setOpen(open === "profile" ? null : "profile")}>
            <Detail label="الاسم" value={user.name} />
            <Detail label="البريد الإلكتروني" value={user.email} />
            <Detail label="الدور" value={ROLE_LABELS_AR[user.role]} />
          </Row>
          <Row icon="notifications-outline" label="إعدادات الإشعارات" expanded={open === "notifications"} onPress={() => setOpen(open === "notifications" ? null : "notifications")}>
            <Detail label="الإشعارات داخل التطبيق" value="مفعّلة" />
            <Button label="عرض الإشعارات" variant="outline" onPress={() => router.push("/(tabs)/more/notifications")} />
          </Row>
          <Row icon="shield-checkmark-outline" label="الأمان والخصوصية" expanded={open === "security"} onPress={() => setOpen(open === "security" ? null : "security")}>
            <Detail label="تشفير الاتصال" value="TLS مفعّل" />
            <Detail label="جلسة الدخول" value="صالحة لمدة 7 أيام" />
          </Row>
          <Card style={styles.row}>
            <Pressable style={styles.rowHead} onPress={toggleNafath} disabled={verifying}>
              <Ionicons name="finger-print-outline" size={22} color={colors.primary} />
              <AppText weight="medium" size={15} style={{ flex: 1 }}>
                ربط نفاذ
              </AppText>
              {verifying ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <View style={[styles.nafath, { backgroundColor: user.nafathVerified ? colors.successLight : colors.neutralLight }]}>
                  <Ionicons
                    name={user.nafathVerified ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                    color={user.nafathVerified ? colors.success : colors.neutral}
                  />
                  <AppText weight="bold" size={12} color={user.nafathVerified ? colors.success : colors.neutral}>
                    {user.nafathVerified ? "مفعّل" : "غير مفعّل"}
                  </AppText>
                </View>
              )}
            </Pressable>
          </Card>
        </View>

        <Button label="تسجيل الخروج" variant="dangerOutline" onPress={logout} style={styles.logout} />
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  expanded,
  onPress,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  expanded: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Card style={styles.row}>
      <Pressable style={styles.rowHead} onPress={onPress}>
        <Ionicons name={icon} size={22} color={colors.primary} />
        <AppText weight="medium" size={15} style={{ flex: 1 }}>
          {label}
        </AppText>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
      </Pressable>
      {expanded ? <View style={styles.rowBody}>{children}</View> : null}
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <AppText size={13} color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText weight="medium" size={13} align="left">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  profile: { gap: spacing.sm },
  profileTop: { flexDirection: "row-reverse", gap: spacing.lg, alignItems: "center" },
  avatarBusy: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 38,
    backgroundColor: "rgba(6,56,75,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoError: { marginTop: spacing.xs },
  profileText: { flex: 1, alignItems: "flex-end", gap: 4 },
  contact: { marginTop: spacing.md },
  menu: { gap: spacing.sm },
  row: { paddingVertical: spacing.md },
  rowHead: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  rowBody: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  detail: { flexDirection: "row-reverse", justifyContent: "space-between" },
  nafath: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  logout: { marginTop: spacing.xl },
});
