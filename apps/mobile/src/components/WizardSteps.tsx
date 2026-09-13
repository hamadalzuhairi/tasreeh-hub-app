import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { AppText } from "./AppText";

const LABELS = ["تفاصيل الطلب", "تحديد الجهة", "مراجعة وإرسال"];

export function WizardSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {LABELS.map((_, index) => {
          const step = index + 1;
          const active = step === current;
          const done = step < current;
          return (
            <View key={step} style={styles.segment}>
              <View style={[styles.circle, (active || done) && styles.circleActive]}>
                {done ? (
                  <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                ) : (
                  <AppText weight="bold" size={14} color={active ? colors.textInverse : colors.textPrimary} align="center">
                    {String(step)}
                  </AppText>
                )}
              </View>
              {index < LABELS.length - 1 ? <View style={[styles.line, done && styles.lineDone]} /> : null}
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {LABELS.map((label, index) => (
          <AppText
            key={label}
            weight={index + 1 === current ? "bold" : "regular"}
            size={12}
            color={index + 1 <= current ? colors.accent : colors.textSecondary}
            align="center"
            style={styles.label}
          >
            {label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const CIRCLE = 34;

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  row: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 22 },
  segment: { flexDirection: "row-reverse", alignItems: "center", flex: 1 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: { backgroundColor: colors.accent },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 6 },
  lineDone: { backgroundColor: colors.accent },
  labelsRow: { flexDirection: "row-reverse", justifyContent: "space-between" },
  label: { width: 90 },
});
