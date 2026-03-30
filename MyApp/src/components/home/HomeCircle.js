import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring
} from 'react-native-reanimated';

function CircleIcon({ f, index, total, onPressFeature }) {
  const circleSize = 240;
  const iconSize   = 44;
  const radius     = circleSize / 2;
  const center     = circleSize / 2;
  const angle      = (2 * Math.PI * index) / total - Math.PI / 2;

  const targetX = center + radius * Math.cos(angle) - iconSize / 2;
  const targetY = center + radius * Math.sin(angle) - iconSize / 2;

  const posX = useSharedValue(targetX);
  const posY = useSharedValue(targetY);

  useEffect(() => {
    posX.value = withSpring(targetX);
    posY.value = withSpring(targetY);
  }, [targetX, targetY]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: posX.value,
    top:  posY.value,
  }));

  return (
    <Animated.View style={[styles.icon, animatedStyle]}>
      {/* ✅ ถ้ามี image ใช้ Image แทน Icon */}
      {f.image ? (
        <Image
          source={f.image}
          style={styles.featureImage}
          onTouchEnd={() => onPressFeature(f)}
        />
      ) : (
        <MaterialCommunityIcons
          name={f.icon}
          size={26}
          onPress={() => onPressFeature(f)}
        />
      )}
    </Animated.View>
  );
}

export default function HomeCircle({
  features, doneMap, doneCount,
  totalCount, treeImage, onPressFeature,
}) {
  const activeFeatures = features.filter(f => !doneMap[f.key]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.circle}>
        <Image source={treeImage} style={styles.image} />
        <Text style={styles.text}>{doneCount}/{totalCount} เป้าหมาย</Text>
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    width: 260, height: 260,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  circle: {
    width: 240, height: 240, borderRadius: 120,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
  },
  image: { width: 100, height: 100 },
  text: { marginTop: 6, fontSize: 15 },
  icon: {
    position: 'absolute',
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#abb9a7ff',
    justifyContent: 'center', alignItems: 'center',
    elevation: 4,
  },
  // ✅ style สำหรับรูปภาพใน icon
  featureImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});