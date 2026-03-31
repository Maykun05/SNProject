import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import LevelBadge from './LevelBadge'; // ✅ เพิ่ม

export default function HomeHeader() {
  return (
    <View style={styles.header}>

      {/* โลโก้ซ้าย */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* ✅ LevelBadge กลาง */}
      <View style={styles.levelWrapper}>
        <LevelBadge />
      </View>

      {/* ✅ พื้นที่ขวา — ProfileAvatar จะลอยอยู่ตรงนี้ผ่าน absolute */}
      <View style={styles.rightPlaceholder} />

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  logo: {
    width: 80,
    height: 44,
  },
  levelWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  // ✅ จองพื้นที่ขวาให้เท่ากับโลโก้ซ้าย
  // ทำให้ LevelBadge อยู่กึ่งกลางพอดี
  rightPlaceholder: {
    width: 80,
    height: 44,
  },
});