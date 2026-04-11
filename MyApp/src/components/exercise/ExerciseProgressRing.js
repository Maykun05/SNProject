import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/**
 * วงความคืบหน้า exercise (โบนัส XP ต่อวัน)
 * @param {number} progress — 0..1
 * @param {string} [centerLabel] — เช่น "2/3"
 * @param {string} [caption] — บรรทัดรองด้านล่าง
 */
export default function ExerciseProgressRing({
  progress,
  centerLabel,
  caption,
  /** สีคงที่ ไม่เปลี่ยนตาม progress */
  accentColor = '#2E7D32',
  trackColor = 'rgba(46, 125, 50, 0.14)',
  themeColor = '#1B5E20',
}) {
  const size = 210;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(Number(progress) || 0, 0), 1);

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
          strokeDashoffset={circumference * (1 - clamped)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {(centerLabel != null || caption != null) && (
        <View style={styles.centerWrap} pointerEvents="box-none">
          {centerLabel != null ? (
            <Text style={[styles.bigText, { color: themeColor }]}>{centerLabel}</Text>
          ) : null}
          {caption != null ? <Text style={styles.captionText}>{caption}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  centerWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 168,
    paddingHorizontal: 6,
  },
  bigText: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  captionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C7A6E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
  },
});
