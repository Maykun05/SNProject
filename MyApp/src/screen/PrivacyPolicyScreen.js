import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#1E4D2B';

const SECTIONS = [
  {
    title: '1. ข้อมูลที่เราเก็บรวบรวม',
    icon: 'document-text-outline',
    content:
      'เราเก็บรวบรวมข้อมูลที่คุณให้ไว้โดยตรง เช่น ชื่อ อีเมล เบอร์โทรศัพท์ รูปโปรไฟล์ และข้อมูลสุขภาพ เช่น จำนวนก้าวเดิน และเป้าหมายออกกำลังกาย',
  },
  {
    title: '2. วัตถุประสงค์การใช้ข้อมูล',
    icon: 'shield-checkmark-outline',
    content:
      'ข้อมูลของคุณถูกใช้เพื่อให้บริการแอปพลิเคชัน ติดตามความคืบหน้าสุขภาพ ปรับปรุงประสบการณ์การใช้งาน และส่งการแจ้งเตือนที่เกี่ยวข้อง',
  },
  {
    title: '3. การแบ่งปันข้อมูล',
    icon: 'people-outline',
    content:
      'เราไม่ขายหรือแบ่งปันข้อมูลส่วนตัวของคุณกับบุคคลที่สาม ยกเว้นในกรณีที่จำเป็นต้องปฏิบัติตามกฎหมาย หรือได้รับความยินยอมจากคุณ',
  },
  {
    title: '4. ความปลอดภัยของข้อมูล',
    icon: 'lock-closed-outline',
    content:
      'เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม เพื่อปกป้องข้อมูลส่วนตัวของคุณจากการเข้าถึง การเปิดเผย หรือการทำลายโดยไม่ได้รับอนุญาต',
  },
  {
    title: '5. สิทธิ์ของผู้ใช้',
    icon: 'person-circle-outline',
    content:
      'คุณมีสิทธิ์เข้าถึง แก้ไข หรือลบข้อมูลส่วนตัวของคุณได้ทุกเมื่อผ่านการตั้งค่าในโปรไฟล์ หากต้องการความช่วยเหลือสามารถติดต่อเราได้ตามช่องทางด้านล่าง',
  },
  {
    title: '6. การเปลี่ยนแปลงนโยบาย',
    icon: 'refresh-outline',
    content:
      'เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว หากมีการเปลี่ยนแปลงสำคัญ เราจะแจ้งให้คุณทราบผ่านการแจ้งเตือนในแอปหรืออีเมล',
  },
  {
    title: '7. ติดต่อเรา',
    icon: 'mail-outline',
    content:
      'หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อเราที่\nอีเมล: privacy@snproject.com',
  },
];

function SectionCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={item.icon} size={20} color={GREEN} />
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <Text style={styles.cardContent}>{item.content}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>นโยบายความเป็นส่วนตัว</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Banner ── */}
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={48} color="#FFF" />
          <Text style={styles.bannerTitle}>นโยบายความเป็นส่วนตัว</Text>
          <Text style={styles.bannerSubtitle}>อัปเดตล่าสุด: 1 มกราคม 2568</Text>
        </View>

        {/* ── Intro ── */}
        <Text style={styles.intro}>
          แอปพลิเคชัน SN Project ให้ความสำคัญกับความเป็นส่วนตัวของคุณ
          โปรดอ่านนโยบายนี้เพื่อทำความเข้าใจว่าเราเก็บรวบรวม
          ใช้ และปกป้องข้อมูลของคุณอย่างไร
        </Text>

        {/* ── Sections ── */}
        {Array.isArray(SECTIONS) &&
          SECTIONS.map((item) => (
            <SectionCard key={item.title} item={item} />
          ))
        }

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Ionicons name="checkmark-circle" size={20} color={GREEN} />
          <Text style={styles.footerText}>
            การใช้งานแอปถือว่าคุณยอมรับนโยบายนี้แล้ว
          </Text>
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GREEN,
  },

  /* ── Content ── */
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },

  /* ── Banner ── */
  banner: {
    backgroundColor: GREEN,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: GREEN,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },

  /* ── Intro ── */
  intro: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  /* ── Section Card ── */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
    flex: 1,
  },
  cardContent: {
    fontSize: 13,
    color: '#555',
    lineHeight: 21,
  },

  /* ── Footer ── */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 13,
    color: GREEN,
    fontWeight: '600',
  },
});