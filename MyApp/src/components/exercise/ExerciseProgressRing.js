import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

function clamp01(v) {
  return Math.min(Math.max(Number(v) || 0, 0), 1);
}

const originProps = (size) => ({
  rotation: '-90',
  origin: `${size / 2}, ${size / 2}`,
});

/**
 * วงซ้อน exercise — วงใน: ขั้นต่ำหน้าแรก (0..1) · วงนอก: โบนัส XP ต่อวัน (0..1)
 * ใต้แหวนมี legend สองแถว (จุดสีตามวงใน/วงนอก)
 * @param {number} innerProgress
 * @param {number} outerProgress
 * @param {string} [centerLabel]
 * @param {string} [caption]
 * @param {boolean} [centerCompact] — ตัวหนังสือกลางเล็กลง (เช่น คำว่า สำเร็จ)
 */
export default function ExerciseProgressRing({
  innerProgress,
  outerProgress,
  centerLabel,
  caption,
  centerCompact = false,
  innerTrackColor = 'rgba(27, 94, 32, 0.18)',
  innerAccentColor = '#1B5E20',
  outerTrackColor = 'rgba(46, 125, 50, 0.14)',
  outerAccentColor = '#43A047',
  themeColor = '#1B5E20',
}) {
  const size = 210;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidthOuter = 12;
  const strokeWidthInner = 10;
  const radiusOuter = 88;
  const radiusInner = 70;
  const circumferenceOuter = 2 * Math.PI * radiusOuter;
  const circumferenceInner = 2 * Math.PI * radiusInner;
  const innerClamped = clamp01(innerProgress);
  const outerClamped = clamp01(outerProgress);
  const rot = originProps(size);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.ringStage, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            stroke={outerTrackColor}
            cx={cx}
            cy={cy}
            r={radiusOuter}
            strokeWidth={strokeWidthOuter}
            fill="none"
          />
          <Circle
            stroke={innerTrackColor}
            cx={cx}
            cy={cy}
            r={radiusInner}
            strokeWidth={strokeWidthInner}
            fill="none"
          />
          <Circle
            stroke={innerAccentColor}
            cx={cx}
            cy={cy}
            r={radiusInner}
            strokeWidth={strokeWidthInner}
            fill="none"
            strokeDasharray={circumferenceInner}
            strokeDashoffset={circumferenceInner * (1 - innerClamped)}
            strokeLinecap="round"
            {...rot}
          />
          <Circle
            stroke={outerAccentColor}
            cx={cx}
            cy={cy}
            r={radiusOuter}
            strokeWidth={strokeWidthOuter}
            fill="none"
            strokeDasharray={circumferenceOuter}
            strokeDashoffset={circumferenceOuter * (1 - outerClamped)}
            strokeLinecap="round"
            {...rot}
          />
        </Svg>

        {(centerLabel != null || caption != null) && (
          <View style={styles.centerWrap} pointerEvents="box-none">
            {centerLabel != null ? (
              <Text
                style={[
                  centerCompact ? styles.centerWordCompact : styles.bigText,
                  { color: themeColor },
                ]}
              >
                {centerLabel}
              </Text>
            ) : null}
            {caption != null ? <Text style={styles.captionText}>{caption}</Text> : null}
          </View>
        )}
      </View>

      <View style={styles.legendWrap}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: innerAccentColor }]} />
          <Text style={styles.legendLabel}>ความคืบหน้าการออกกำลังกาย</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: outerAccentColor }]} />
          <Text style={styles.legendLabel}>โบนัส XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  ringStage: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    maxWidth: 210,
    alignSelf: 'center',
  },
  bigText: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    textAlign: 'center',
  },
  centerWordCompact: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
  captionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#43A047',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
    alignSelf: 'center',
    maxWidth: 168,
  },
  legendWrap: {
    marginTop: 10,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#5C7A6E',
    lineHeight: 15,
  },
});
