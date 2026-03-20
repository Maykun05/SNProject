import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function ProgressRing({ consumed, recommended }) {
  const progress = recommended === 0 ? 0 : Math.min(consumed / recommended, 1);
  const size = 220; 
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        <Circle stroke="#DBE4E0" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" />
        <Circle
          stroke="#6B8E78" // สีเขียวตาม Figma
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.centerText}>
        <Text style={styles.bigText}>{consumed} ml/</Text>
        <Text style={styles.smallText}>{recommended} ml</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  centerText: { position: "absolute", alignItems: "center" },
  bigText: { fontSize: 28, fontWeight: "bold", color: "#333" },
  smallText: { fontSize: 20, color: "#333" },
});