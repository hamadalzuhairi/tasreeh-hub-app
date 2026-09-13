import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { REQUEST_TYPE_LABELS_AR, type MediaRequest } from "@tasreeh/shared";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { formatDate } from "../utils/format";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { Pill } from "./Pill";
import { TYPE_TONE } from "./RequestCard";

interface ArchiveItemCardProps {
  item: MediaRequest;
  onPress?: () => void;
  showBadge?: boolean; // archive shows the type badge; search results show a date icon instead
}

export function ArchiveItemCard({ item, onPress, showBadge = true }: ArchiveItemCardProps) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.icon}>
        <Ionicons
          name={item.type === "interview" ? "play-circle-outline" : "document-text-outline"}
          size={22}
          color={colors.info}
        />
      </View>
      <View style={styles.body}>
        <AppText weight="bold" size={14} numberOfLines={2}>
          {item.subject}
        </AppText>
        <AppText size={12} color={colors.textSecondary}>
          {item.department?.nameAr ?? ""}
        </AppText>
        {showBadge ? null : (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
            <AppText size={12} color={colors.textSecondary}>
              {formatDate(item.createdAt)}
            </AppText>
          </View>
        )}
      </View>
      {showBadge ? (
        <View style={styles.side}>
          <Pill label={REQUEST_TYPE_LABELS_AR[item.type]} tone={TYPE_TONE[item.type]} size="sm" />
          <AppText size={12} color={colors.textMuted} align="left">
            {formatDate(item.createdAt)}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row-reverse", gap: spacing.md, alignItems: "flex-start" },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.infoLight,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 6, alignItems: "flex-end", paddingTop: 2 },
  dateRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  side: { justifyContent: "space-between", alignItems: "flex-start", alignSelf: "stretch", gap: spacing.lg },
});
