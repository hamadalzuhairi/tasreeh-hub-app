import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Notification, NotificationType } from "@tasreeh/shared";
import { useMarkNotificationRead, useNotifications, type NotificationFilter } from "../../../src/api/hooks/useNotifications";
import { AppText } from "../../../src/components/AppText";
import { ChipGroup } from "../../../src/components/ChipGroup";
import { Screen } from "../../../src/components/Screen";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/typography";
import { formatRelative } from "../../../src/utils/format";

const TYPE_STYLE: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; fg: string; bg: string; tag: string }> = {
  urgent_overdue: { icon: "notifications", fg: colors.danger, bg: colors.dangerLight, tag: "هامة" },
  status_update: { icon: "checkmark-done-outline", fg: colors.success, bg: colors.successLight, tag: "تحديثات" },
  general: { icon: "notifications-outline", fg: colors.info, bg: colors.infoLight, tag: "تنبيهات" },
};

function NotificationRow({ item, onPress }: { item: Notification; onPress: () => void }) {
  const style = TYPE_STYLE[item.type];
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.icon, { backgroundColor: style.bg }]}>
        <Ionicons name={style.icon} size={22} color={style.fg} />
      </View>
      <View style={styles.text}>
        <AppText weight={item.isRead ? "medium" : "bold"} size={14}>
          {item.title}
        </AppText>
        <AppText size={13} color={colors.textSecondary} numberOfLines={2}>
          {item.body}
        </AppText>
        <AppText size={12} color={colors.textMuted}>
          {formatRelative(item.createdAt)}
        </AppText>
      </View>
      <View style={styles.side}>
        <AppText size={11} color={colors.textMuted} align="left">
          {style.tag}
        </AppText>
        {!item.isRead ? <View style={styles.unread} /> : null}
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const notifications = useNotifications(filter);
  const markRead = useMarkNotificationRead();

  return (
    <Screen title="الإشعارات" showBack>
      <View style={styles.controls}>
        <ChipGroup
          stretch
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "الكل" },
            { key: "important", label: "هامة" },
            { key: "alerts", label: "تنبيهات" },
            { key: "updates", label: "تحديثات" },
          ]}
        />
      </View>
      <FlatList
        data={notifications.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            onPress={() => {
              if (!item.isRead) markRead.mutate(item.id);
              if (item.requestId) router.push(`/(tabs)/requests/${item.requestId}`);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          notifications.isLoading ? null : (
            <AppText size={14} color={colors.textSecondary} align="center" style={styles.empty}>
              لا توجد إشعارات
            </AppText>
          )
        }
        refreshing={notifications.isRefetching}
        onRefresh={() => notifications.refetch()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { padding: spacing.lg, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: { flexDirection: "row-reverse", gap: spacing.md, paddingVertical: spacing.lg, alignItems: "flex-start" },
  icon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, alignItems: "flex-end", gap: 3 },
  side: { alignItems: "flex-start", gap: spacing.sm, paddingTop: 2 },
  unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  divider: { height: 1, backgroundColor: colors.border },
  empty: { paddingVertical: spacing.xxl },
});
