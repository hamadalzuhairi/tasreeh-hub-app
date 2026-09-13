import { StyleSheet, View } from "react-native";
import type { DepartmentPerformance } from "@tasreeh/shared";
import { colors } from "../theme/colors";
import { spacing } from "../theme/typography";
import { AppText } from "./AppText";

// Mockup bar colors by rank: teal, teal, blue, indigo, slate.
const BAR_COLORS = ["#0B7A64", "#138C74", "#1C7ED6", "#3B63D6", "#6B7C8A"];

export function DeptBarChart({ data }: { data: DepartmentPerformance[] }) {
  return (
    <View style={styles.container}>
      {data.map((dept, index) => (
        <View key={dept.departmentId} style={styles.row}>
          <AppText size={13} color={colors.textPrimary} style={styles.name} numberOfLines={1}>
            {dept.departmentName}
          </AppText>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.min(Math.max(dept.slaCompliancePct, 0), 100)}%`,
                  backgroundColor: BAR_COLORS[Math.min(index, BAR_COLORS.length - 1)],
                },
              ]}
            />
          </View>
          <AppText weight="medium" size={13} color={colors.textPrimary} align="left" style={styles.pct}>
            {`${Math.round(dept.slaCompliancePct)}%`}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  row: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  name: { width: 118 },
  // Fill grows from the left edge, as in the mockup.
  track: { flex: 1, height: 10, borderRadius: 999, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
  pct: { width: 38 },
});
