import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useLevel } from '../../context/LevelContext'; // ✅ เพิ่ม

export default function HomeHeader() {
  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel(); // ✅ เพิ่ม

  return (
    <View style={styles.header}>
      {/* โลโก้ซ้าย */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Level ตรงกลาง */}
      <View style={styles.levelCenter}>
        <Text style={[styles.levelTitle, { color: levelInfo.color }]}>
          {levelInfo.emoji} Lv.{level}{levelInfo.name}
        </Text>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, {
            width: `${xpPercent}%`,
            backgroundColor: levelInfo.color,
          }]} />
        </View>
        <Text style={styles.xpText}>{xp} / {xpRequired} XP</Text>
      </View>

      {/* ช่องว่างขวา สำหรับ ProfileAvatar */}
      <View style={styles.rightSpace} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',   
    alignItems: 'center',  
    marginBottom: 12,
    paddingLeft: 0,
    paddingTop: 5,
    paddingTop: 44, 
  backgroundColor: '#fff',
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
    gap: 3,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  xpBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 6,
    borderRadius: 3,
  },
  xpText: {
    fontSize: 11,
    color: '#999',
  },
  rightSpace: {
    width: 80,
  },
  username: { marginTop: 8 },
});