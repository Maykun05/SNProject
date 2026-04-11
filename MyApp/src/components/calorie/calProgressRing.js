import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

/**
 * วงความคืบหน้าแคลอรี่ (kcal)
 * @param {number} consumed
 * @param {number} recommended — เป้าหมายรายวัน (kcal)
 * @param {number} [recommendedDaily] — แคลลอรี่แนะนำจากสูตร
 * @param {() => void} [onEditGoal]
 */
export default function CalProgressRing({
  consumed,
  recommended,
  accentColor = "#D9781C",
  trackColor = "rgba(184, 92, 20, 0.12)",
  themeColor = "#B85C14",
  recommendedDaily,
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
        <Text style={[styles.bigText, { color: themeColor }]}>{consumed}</Text>
        <Text style={[styles.unitText, { color: themeColor }]}> กิโลแคลอรี่ </Text>
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>เป้าหมาย {recommended} </Text>
          {onEditGoal ? (
            <TouchableOpacity onPress={onEditGoal} hitSlop={10} style={styles.editHit}>
              <Ionicons name="create-outline" size={17} color={themeColor} />
            </TouchableOpacity>
          ) : null}
        </View>
        {/* {recommendedDaily != null ? (
          <Text style={styles.recText}>แนะนำ {recommendedDaily} </Text>
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
    maxWidth: 160,
    paddingHorizontal: 4,
  },
  bigText: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
  },
  unitText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 0,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 6,
  },
  goalText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5D4037",
    textAlign: "center",
  },
  editHit: { padding: 2 },
  recText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8D6E63",
    marginTop: 5,
    textAlign: "center",
  },
});
