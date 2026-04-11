import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

/**
 * วงความคืบหน้าน้ำ (ml)
 * @param {number} consumed — ดื่มแล้ววันนี้ (ml)
 * @param {number} recommended — เป้าหมายรายวัน (ml)
 * @param {number} [recommendedDaily] — ปริมาณแนะนำจากสูตร
 * @param {() => void} [onEditGoal]
 */
export default function WaterProgressRing({
  consumed,
  recommended,
  accentColor = "#2196F3",
  trackColor = "#E3F2FD",
  recommendedDaily,
  onEditGoal,
}) {
  const rec = Number(recommended) || 0;
  const use = Number(consumed) || 0;
  const ratio = rec <= 0 ? 0 : use / rec;
  /** ครบหรือเกินเป้าให้ถือว่า 1 เต็มวง — กันทศนิยม/SVG ค้างไม่ปิดวง */
  const progress = ratio >= 1 ? 1 : Math.min(Math.max(ratio, 0), 1);
  const size = 210;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = progress >= 1 ? 0 : circumference * (1 - progress);

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        <Circle
          stroke={trackColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          stroke={accentColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.centerWrap} pointerEvents="box-none">
        <Text style={styles.bigText}>{consumed}</Text>
        <Text style={styles.unitText}> มิลลิลิตร </Text>

        <View style={styles.goalRow}>
          <Text style={styles.goalText}>เป้าหมาย {recommended}</Text>
          {onEditGoal ? (
            <TouchableOpacity onPress={onEditGoal} hitSlop={10} style={styles.editHit}>
              <Ionicons name="create-outline" size={17} color="#1565C0" />
            </TouchableOpacity>
          ) : null}
        </View>
{/* 
        {recommendedDaily != null ? (
          <Text style={styles.recText}>แนะนำ {recommendedDaily} มล./วัน</Text>
        ) : null} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  centerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 150,
    paddingHorizontal: 4,
  },
  bigText: { fontSize: 32, fontWeight: "800", color: "#0D47A1", lineHeight: 36 },
  unitText: { fontSize: 12, fontWeight: "600", color: "#1565C0", marginTop: 0 },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 6,
  },
  goalText: { fontSize: 12, fontWeight: "700", color: "#455A64" },
  editHit: { padding: 2 },
  recText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#607D8B",
    marginTop: 5,
    textAlign: "center",
  },
});
