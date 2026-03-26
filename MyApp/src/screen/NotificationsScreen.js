import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Switch, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

const GREEN = '#1E4D2B';

const NOTI_ITEMS = [
  { key: 'dailyReminder',   label: 'เตือนก้าวเดินรายวัน',     icon: 'footsteps-outline'      },
  { key: 'goalAchieved',    label: 'แจ้งเตือนเมื่อถึงเป้าหมาย', icon: 'trophy-outline'         },
  { key: 'weeklyReport',    label: 'รายงานสรุปรายสัปดาห์',     icon: 'bar-chart-outline'      },
  { key: 'waterReminder',   label: 'เตือนดื่มน้ำ',             icon: 'water-outline'          },
  { key: 'exerciseReminder',label: 'เตือนออกกำลังกาย',         icon: 'bicycle-outline'        },
];

export default function NotificationsScreen({ navigation }) {
  const { profile, updateSettings } = useProfile();

  // ✅ อ่านจาก profile.settings.notifications (object)
  const savedNoti = typeof profile.settings?.notifications === 'object'
    ? profile.settings.notifications
    : {};

  const initState = () =>
    Object.fromEntries(NOTI_ITEMS.map(({ key }) => [key, savedNoti[key] ?? true]));

  const [notiState, setNotiState] = useState(initState);
  const [masterOn,  setMasterOn]  = useState(
    Object.values(initState()).some(Boolean)
  );

  const toggleMaster = (val) => {
    setMasterOn(val);
    setNotiState(Object.fromEntries(NOTI_ITEMS.map(({ key }) => [key, val])));
  };

  const toggleItem = (key, val) => {
    const next = { ...notiState, [key]: val };
    setNotiState(next);
    setMasterOn(Object.values(next).some(Boolean));
  };

  const handleSave = () => {
    updateSettings({ notifications: notiState });
    Alert.alert('บันทึกสำเร็จ', 'ตั้งค่าการแจ้งเตือนถูกอัปเดตแล้ว', [
      { text: 'ตกลง', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Master Switch ── */}
        <View style={styles.masterCard}>
          <View style={styles.cardHeaderIndicator} />
          <View style={styles.masterRow}>
            <View style={styles.iconBox}>
              <Ionicons name="notifications-outline" size={22} color={GREEN} />
            </View>
            <Text style={styles.masterLabel}>เปิด/ปิดการแจ้งเตือนทั้งหมด</Text>
            <Switch
              value={masterOn}
              onValueChange={toggleMaster}
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={masterOn ? GREEN : '#FFF'}
            />
          </View>
        </View>

        {/* ── Individual Items ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderIndicator} />
          <Text style={styles.sectionTitle}>ตั้งค่าการแจ้งเตือนแต่ละรายการ</Text>
          {NOTI_ITEMS.map((item, index) => (
            <React.Fragment key={item.key}>
              <View style={styles.notiRow}>
                <View style={styles.iconBoxSmall}>
                  <Ionicons name={item.icon} size={18} color={GREEN} />
                </View>
                <Text style={styles.notiLabel}>{item.label}</Text>
                <Switch
                  value={notiState[item.key]}
                  onValueChange={(val) => toggleItem(item.key, val)}
                  trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                  thumbColor={notiState[item.key] ? GREEN : '#FFF'}
                  disabled={!masterOn}
                />
              </View>
              {index < NOTI_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Save ── */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
          <Text style={styles.saveBtnText}>บันทึกการตั้งค่า</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>ยกเลิก</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: GREEN },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  masterCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
    overflow: 'hidden', gap: 4,
  },
  cardHeaderIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: GREEN,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: GREEN, marginBottom: 8 },
  masterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  masterLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#222' },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
  },
  iconBoxSmall: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
  },
  notiRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  notiLabel: { flex: 1, fontSize: 14, color: '#444' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: GREEN, paddingVertical: 15, borderRadius: 30,
    marginTop: 10, gap: 8, elevation: 4,
    shadowColor: GREEN, shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 6,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { fontSize: 15, color: '#999' },
});