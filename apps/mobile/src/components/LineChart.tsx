import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";
import { colors } from "../theme/colors";
import { AppText } from "./AppText";
import { useSvgId } from "./Logo";

interface LineChartProps {
  values: number[];
  labels: string[]; // x-axis labels, oldest → newest; drawn right-to-left like the mockup
  height?: number;
  unitSuffix?: string; // e.g. "h" for the reports chart y-axis
  maxTicks?: number;
}

const AXIS_WIDTH = 30;

function niceMax(max: number) {
  if (max <= 0) return 24;
  const step = Math.ceil(max / 4 / 6) * 6 || 6;
  return step * 4;
}

// Catmull-Rom → cubic Bézier for the smooth curve in the mockup. Control points are clamped to
// the segment's own y-range so the curve never dips below zero or overshoots a peak.
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const lo = Math.min(p1.y, p2.y);
    const hi = Math.max(p1.y, p2.y);
    const clamp = (y: number) => Math.min(hi, Math.max(lo, y));
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = clamp(p1.y + (p2.y - p0.y) / 6);
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = clamp(p2.y - (p3.y - p1.y) / 6);
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function LineChart({ values, labels, height = 170, unitSuffix = "", maxTicks = 7 }: LineChartProps) {
  const [width, setWidth] = useState(0);
  const fillId = useSvgId("areaFill");
  const plotW = Math.max(width - AXIS_WIDTH, 0);
  const plotH = height;
  const top = niceMax(Math.max(...values, 0));
  const ticks = [top, (top * 3) / 4, top / 2, top / 4, 0];

  // Newest point on the left edge is how the mockup reads; index 0 (oldest) sits on the right.
  const stepX = values.length > 1 ? plotW / (values.length - 1) : 0;
  // A 0 means "no responses that day", not a 0-hour response, so those days are skipped
  // (their x-slot is kept) unless the whole series is empty.
  const hasData = values.some((v) => v > 0);
  const points = values
    .map((v, i) => ({ v, x: plotW - i * stepX, y: 6 + (plotH - 12) * (1 - v / top) }))
    .filter((p) => !hasData || p.v > 0);
  const line = smoothPath(points);
  const area = points.length > 1 ? `${line} L ${points[points.length - 1].x} ${plotH} L ${points[0].x} ${plotH} Z` : "";

  const labelEvery = Math.max(1, Math.ceil(labels.length / maxTicks));

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.row}>
        <View style={[styles.axis, { height: plotH }]}>
          {ticks.map((t) => (
            <AppText key={t} size={10} color={colors.textMuted} align="left">
              {`${Math.round(t)}${unitSuffix}`}
            </AppText>
          ))}
        </View>
        {plotW > 0 ? (
          <Svg width={plotW} height={plotH}>
            <Defs>
              <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.accent} stopOpacity={0.28} />
                <Stop offset="1" stopColor={colors.accent} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>
            {ticks.map((t) => {
              const y = 6 + (plotH - 12) * (1 - t / top);
              return <Line key={t} x1={0} x2={plotW} y1={y} y2={y} stroke={colors.border} strokeDasharray="3 4" />;
            })}
            {area ? <Path d={area} fill={`url(#${fillId})`} /> : null}
            {line ? <Path d={line} stroke={colors.accent} strokeWidth={2.5} fill="none" /> : null}
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={colors.accent} />
            ))}
          </Svg>
        ) : null}
      </View>
      <View style={[styles.labels, { marginLeft: AXIS_WIDTH }]}>
        {labels.map((label, i) =>
          i % labelEvery === 0 ? (
            <AppText key={i} size={10} color={colors.textMuted} align="center" style={styles.label}>
              {label}
            </AppText>
          ) : null
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  axis: { width: AXIS_WIDTH, justifyContent: "space-between", paddingVertical: 0 },
  labels: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 6 },
  label: { minWidth: 30 },
});
