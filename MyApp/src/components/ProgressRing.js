import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function ProgressRing({ consumed, recommended }) {

  const progress =
    recommended === 0
      ? 0
      : Math.min(consumed / recommended, 1);

  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.wrapper}>

      <Svg width={size} height={size}>

        {/* background */}
        <Circle
          stroke="#E0E0E0"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* progress */}
        <Circle
          stroke="#4CAF50"
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

      {/* center text */}
      <View style={styles.centerText}>
        <Text style={styles.bigText}>
          {consumed}
        </Text>

        <Text style={styles.smallText}>
          / {recommended} kcal
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },

  centerText: {
    position: "absolute",
    alignItems: "center",
  },

  bigText: {
    fontSize: 26,
    fontWeight: "bold",
  },

  smallText: {
    fontSize: 14,
    color: "#666",
  },

});