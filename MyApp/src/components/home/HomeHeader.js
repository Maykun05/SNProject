import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLevel } from '../../context/LevelContext';

/** โทนเดียวกับ ProfileScreen / ProfileScreen.README.md */
const GREEN = '#1E4D2B';
const XP_BAR_END = '#5FA578';

export default function HomeHeader() {
  const insets = useSafeAreaInsets();
  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel();
  const xpFill = Math.min(100, Math.max(0, Number.isFinite(xpPercent) ? xpPercent : 0));

  return (
    <LinearGradient
      colors={['#EEF5F0', '#FFFFFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, 10) + 6,
        },
      ]}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.levelCenter}>
        <Text style={styles.levelTitle}>
          {(levelInfo?.emoji ?? '')} Lv.{level ?? 0} {(levelInfo?.name ?? '')}
        </Text>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFillWrap, { width: `${xpFill}%` }]}>
            <LinearGradient
              colors={[GREEN, XP_BAR_END]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>
        <Text style={styles.xpText}>
          {xp} / {xpRequired} XP
        </Text>
        <Text style={styles.xpHint} numberOfLines={2}>
          ทำฟีเจอร์วันนี้ครบเป้า +10 XP · ภารกิจ +XP ตามการ์ด
        </Text>
      </View>

      <View style={styles.rightSpace} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: GREEN,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'flex-start',
  },
  levelCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
  },
  xpBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(30, 77, 43, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFillWrap: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpText: {
    fontSize: 11,
    color: '#5A6F62',
    fontWeight: '500',
  },
  xpHint: {
    fontSize: 10,
    color: '#6E8B78',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
    lineHeight: 14,
  },
  rightSpace: {
    width: 80,
  },
  username: { marginTop: 8 },
});