import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity
} from 'react-native';
import { useLevel } from '../../context/LevelContext';

export default function LevelBadge({ onPress }) {
  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel();

  // Animate XP bar
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: xpPercent / 100,
      useNativeDriver: false,
      friction: 6,
    }).start();
  }, [xpPercent]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Level circle */}
      <View style={[styles.levelCircle, { borderColor: levelInfo.color }]}>
        <Text style={styles.levelNumber}>{level}</Text>
        <Text style={styles.levelLabel}>LV</Text>
      </View>

      {/* Name + XP bar */}
      <View style={styles.infoBox}>
        <Text style={[styles.levelName, { color: levelInfo.color }]}>
          {levelInfo.displayName}
        </Text>

        {/* XP Bar */}
        <View style={styles.xpBarBg}>
          <Animated.View
            style={[
              styles.xpBarFill,
              { width: barWidth, backgroundColor: levelInfo.color },
            ]}
          />
        </View>

        <Text style={styles.xpText}>
          {xp} / {xpRequired} XP
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FFF9',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  levelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  levelNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E4D2B',
    lineHeight: 17,
  },
  levelLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
  },
  infoBox: {
    flex: 1,
    gap: 4,
  },
  levelName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  xpBarBg: {
    height: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 6,
    borderRadius: 3,
  },
  xpText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
});