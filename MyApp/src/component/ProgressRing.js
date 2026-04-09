import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

/**
 * @param {number} consumed — ดื่มแล้ววันนี้ (ml)
 * @param {number} recommended — เป้าหมายรายวัน (ml) ใช้คำนวณความยาววง
 * @param {number} [recommendedDaily] — ปริมาณแนะนำจากสูตร (แสดงในกลางวง)
 * @param {string} [metaLine] — บรรทัดเล็ก เช่น นน. · Lv.
 * @param {() => void} [onEditGoal] — แก้ไขเป้า
 */
export default function ProgressRing({
  consumed,
  recommended,
  accentColor = "#2196F3",
  trackColor = "#E3F2FD",
  recommendedDaily,
  metaLine,
  onEditGoal,
}) {
  const progress = recommended === 0 ? 0 : Math.min(consumed / recommended, 1);
  const size = 210;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.centerWrap} pointerEvents="box-none">
        <Text style={styles.bigText}>{consumed}</Text>
        <Text style={styles.unitText}>ml วันนี้</Text>

        <View style={styles.goalRow}>
          <Text style={styles.goalText}>เป้า {recommended} ml</Text>
          {onEditGoal ? (
            <TouchableOpacity onPress={onEditGoal} hitSlop={10} style={styles.editHit}>
              <Ionicons name="create-outline" size={17} color="#1565C0" />
            </TouchableOpacity>
          ) : null}
        </View>

        {recommendedDaily != null ? (
          <Text style={styles.recText}>แนะนำ {recommendedDaily} มล./วัน</Text>
        ) : null}
        {metaLine ? <Text style={styles.metaText} numberOfLines={2}>{metaLine}</Text> : null}
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
  metaText: {
    fontSize: 10,
    color: "#90A4AE",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 13,
  },
});
