import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeOut,
} from 'react-native-reanimated';

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
          console.log("TOUCH ICON:", f.key);
          onPressFeature(f);}}
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
        <Text style={styles.goalEmoji}>🌿</Text>
        <Text style={styles.goalText}>{doneCount}/{totalCount} เป้าหมาย</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    marginTop: 16,
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
    borderWidth: 4,
    borderColor: '#7aab6d',
    backgroundColor: '#e8f5e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4a7c3f',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
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
    backgroundColor: '#ffffffee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#a8c89f',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: '#4a7c3f',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#2d5a1b',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  goalEmoji: { fontSize: 16 },
  goalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});