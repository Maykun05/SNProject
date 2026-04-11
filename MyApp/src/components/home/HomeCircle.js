import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeOut,
} from 'react-native-reanimated';
/** โทนเดียวกับ ProfileScreen / ProfileScreen.README.md */
const GREEN = '#1E4D2B';
const HERO_MINT = '#EEF5F0';
const RING_MUTE = '#E8EFE9';

const CIRCLE_DIAMETER = 220;
const ICON_SIZE = 48;
const WRAPPER_SIZE = 280;
const ICON_RADIUS = CIRCLE_DIAMETER / 2;

function CircleIcon({ f, index, total, onPressFeature }) {
  const center = WRAPPER_SIZE / 2;
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;

  const targetX = center + ICON_RADIUS * Math.cos(angle) - ICON_SIZE / 2;
  const targetY = center + ICON_RADIUS * Math.sin(angle) - ICON_SIZE / 2;

  const posX = useSharedValue(targetX);
  const posY = useSharedValue(targetY);

  useEffect(() => {
    posX.value = withSpring(targetX, { damping: 14, stiffness: 100 });
    posY.value = withSpring(targetY, { damping: 14, stiffness: 100 });
  }, [targetX, targetY]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: posX.value,
    top: posY.value,
  }));

  return (
    <Animated.View
      style={[styles.icon, animatedStyle]}
      exiting={FadeOut.duration(400)}
    >
      <TouchableOpacity
        style={styles.iconTouchable}
        onPress={() => {
          onPressFeature(f);
        }}
        activeOpacity={0.75}
      >
        <Image source={f.image} style={styles.iconImage} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeCircle({
  features,
  doneMap,
  doneCount,
  totalCount,
  treeImage,
  onPressFeature,
  onPressTree,
}) {
  const activeFeatures = features.filter(f => !doneMap[f.key]);

  const treeScale = useSharedValue(1);
  const prevDoneCount = useRef(doneCount);

  useEffect(() => {
    if (doneCount > prevDoneCount.current) {
      treeScale.value = withSpring(1.15, { damping: 6, stiffness: 200 }, () => {
        treeScale.value = withSpring(1, { damping: 10, stiffness: 150 });
      });
    }
    prevDoneCount.current = doneCount;
  }, [doneCount]);

  const treeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: treeScale.value }],
  }));

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.wrapper}>

        <View style={styles.circle}>
          <TouchableOpacity onPress={onPressTree} activeOpacity={0.85}>
            {/* ✅ Animated.View ครอบแทน Animated.Image → bounce ไม่ถูก overflow ตัด */}
            <Animated.View style={treeAnimStyle}>
              <Image
                source={treeImage}
                style={styles.treeImage}
                resizeMode="cover"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {activeFeatures.map((f, index) => (
          <CircleIcon
            key={f.key}
            f={f}
            index={index}
            total={activeFeatures.length}
            onPressFeature={onPressFeature}
          />
        ))}
      </View>

      <View style={styles.goalBadge}>
        <View style={styles.goalLabelRow}>
          <Ionicons name="leaf-outline" size={15} color="#7A9A84" />
          <Text style={styles.goalCaption}>เป้าหมายวันนี้</Text>
        </View>
        <View style={styles.goalCountRow}>
          <Text style={styles.goalCountNum}>{String(doneCount)}</Text>
          <Text style={styles.goalCountSlash}>/</Text>
          <Text style={styles.goalCountTotal}>{String(totalCount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 8,
  },
  wrapper: {
    width: WRAPPER_SIZE,
    height: WRAPPER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    width: CIRCLE_DIAMETER,
    height: CIRCLE_DIAMETER,
    borderRadius: CIRCLE_DIAMETER / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: GREEN,
    backgroundColor: HERO_MINT,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: GREEN,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  treeImage: {
    width: CIRCLE_DIAMETER,
    height: CIRCLE_DIAMETER,
  },
  icon: {
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: GREEN,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: RING_MUTE,
  },
  iconTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ICON_SIZE / 2,
  },
  iconImage: {
    width: ICON_SIZE - 14,
    height: ICON_SIZE - 14,
  },
  goalBadge: {
    width: WRAPPER_SIZE - 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: HERO_MINT,
    borderWidth: 1,
    borderColor: RING_MUTE,
    elevation: 0,
    shadowOpacity: 0,
  },
  goalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },
  goalCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 0,
  },
  goalCountNum: {
    fontSize: 20,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: -0.4,
  },
  goalCountSlash: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9AAB9E',
    marginHorizontal: 1,
  },
  goalCountTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A6F62',
    letterSpacing: -0.2,
  },
  goalCaption: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A6F62',
    letterSpacing: 0.15,
  },
});