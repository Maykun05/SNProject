import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLevel } from '../../context/LevelContext';
import { useProfile } from '../../context/ProfileContext';

/** โทนเดียวกับ ProfileScreen / ProfileScreen.README.md */
const GREEN = '#1E4D2B';
const XP_BAR_END = '#5FA578';

export default function HomeHeader() {
  const insets = useSafeAreaInsets();
  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel();
  const { profile } = useProfile();
  const coins = profile?.coins ?? 0;
  const xpFill = Math.min(100, Math.max(0, Number.isFinite(xpPercent) ? xpPercent : 0));
  const [showInfo, setShowInfo] = useState(false);

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
        <View style={styles.levelTitleRow}>
          <Text style={styles.levelTitle}>
            {(levelInfo?.emoji ?? '')} Lv.{level ?? 0} {(levelInfo?.name ?? '')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowInfo(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="information-circle-outline" size={16} color={GREEN} opacity={0.6} />
          </TouchableOpacity>
        </View>
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
        <Text style={styles.xpText}>{xp} / {xpRequired} XP</Text>
        <View style={styles.coinRow}>
          <Image source={require('../../assets/coin.png')} style={styles.coinImg} />
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.rightSpace} />

      <Modal visible={showInfo} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowInfo(false)}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>XP และเหรียญ</Text>

            <Text style={styles.infoSectionHead}>⚡ XP คืออะไร?</Text>
            <Text style={styles.infoBody}>
              {'XP ใช้สะสมเพื่อขึ้นเลเวล ได้มาจาก:\n• ทำแต่ละฟีเจอร์ครบเป้าหมาย +10 XP/ฟีเจอร์\n• ออกกำลังกายครบเป้าหมาย +10 XP/ครั้ง (สูงสุด 3 ครั้ง/วัน)\n• สำเร็จภารกิจ → ได้ XP ตามที่ระบุในการ์ดภารกิจในหน้าภารกิจ'}
            </Text>

            <View style={styles.infoSectionHeadRow}>
              <Image source={require('../../assets/coin.png')} style={styles.infoSectionCoinImg} />
              <Text style={styles.infoSectionHead}>เหรียญคืออะไร?</Text>
            </View>
            <Text style={styles.infoBody}>
              {'เหรียญใช้ปลดล็อกต้นไม้แบบใหม่ในหน้าโฮม ได้มาจาก:\n• สำเร็จภารกิจ → ได้เหรียญตามที่ระบุในการ์ดภารกิจในหน้าภารกิจ\n• เลเวลขึ้น +100 เหรียญ'}
            </Text>

            <TouchableOpacity style={styles.infoClose} onPress={() => setShowInfo(false)}>
              <Text style={styles.infoCloseTxt}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  rightSpace: { width: 80 },
  levelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  coinImg: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  coinText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8860B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: GREEN,
    marginBottom: 14,
  },
  infoSectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoSectionCoinImg: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  infoSectionHead: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 6,
  },
  infoBody: {
    fontSize: 13,
    color: '#4A6153',
    lineHeight: 20,
    marginBottom: 14,
  },
  infoClose: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F0F4F2',
    borderRadius: 10,
  },
  infoCloseTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D5A4C',
  },
  username: { marginTop: 8 },
});