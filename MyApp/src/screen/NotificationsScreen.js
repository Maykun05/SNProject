import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
 ScrollView, Switch, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';
import NotificationTimePicker from '../components/notification/NotificationTimePicker';
import { applyNotificationSettings } from '../notifications/exerciseSessionNotification';

const GREEN = '#1E4D2B';

const NOTI_ITEMS = [
  { key: 'dailyReminder',        label: 'เตือนกิจกรรมรายวัน',     icon: 'notifications-outline',   scheduleable: true, defaultTime: '07:00' },
  { key: 'waterReminder',        label: 'เตือนดื่มน้ำ',           icon: 'water-outline',           scheduleable: true, defaultTime: '09:00' },
  { key: 'foodReminder',         label: 'เตือนบันทึกอาหาร',       icon: 'restaurant-outline',      scheduleable: true, defaultTime: '08:00', hasMultipleTimes: true },
  { key: 'exerciseReminder',     label: 'เตือนออกกำลังกาย',       icon: 'bicycle-outline',         scheduleable: true, defaultTime: '07:00' },
  { key: 'sleepReminder',        label: 'เตือนเวลานอน',           icon: 'moon-outline',            scheduleable: true, defaultTime: '22:00' },
  { key: 'moodReminder',         label: 'เตือนบันทึกอารมณ์',      icon: 'happy-outline',           scheduleable: true, defaultTime: '21:00' },
  { key: 'weeklyReport',         label: 'รายงานสรุปรายสัปดาห์',   icon: 'bar-chart-outline',       scheduleable: true, defaultTime: '08:00' },
];

export default function NotificationsScreen({ navigation }) {
  const { profile, updateSettings } = useProfile();

  const savedNoti = typeof profile.settings?.notifications === 'object'
    ? profile.settings.notifications
    : {};

  const initState = () =>
    Object.fromEntries(NOTI_ITEMS.map(({ key }) => [key, savedNoti[key] ?? true]));

  const initTimeState = () => {
    const times = {};
    NOTI_ITEMS.forEach(({ key, defaultTime, hasMultipleTimes }) => {
      if (hasMultipleTimes) {
        times[`${key}Times`] = {
          breakfast: savedNoti[`${key}Times`]?.breakfast ?? '08:00',
          lunch: savedNoti[`${key}Times`]?.lunch ?? '12:00',
          dinner: savedNoti[`${key}Times`]?.dinner ?? '18:00',
        };
      } else if (defaultTime) {
        times[`${key}Time`] = savedNoti[`${key}Time`] ?? defaultTime;
      }
    });
    return times;
  };

  const [notiState, setNotiState] = useState(initState);
  const [timeState, setTimeState] = useState(initTimeState);
  const [masterOn, setMasterOn] = useState(Object.values(initState()).some(Boolean));

  const [pickerVisible, setPickerVisible] = useState(false);
  const [currentTimeKey, setCurrentTimeKey] = useState(null);
  const [currentMealType, setCurrentMealType] = useState(null);

  const toggleMaster = (val) => {
    setMasterOn(val);
    setNotiState(Object.fromEntries(NOTI_ITEMS.map(({ key }) => [key, val])));
  };

  const toggleItem = (key, val) => {
    const next = { ...notiState, [key]: val };
    setNotiState(next);
    setMasterOn(Object.values(next).some(Boolean));
  };

  const openTimePicker = (key, mealType = null) => {
    setCurrentTimeKey(key);
    setCurrentMealType(mealType);
    setPickerVisible(true);
  };

  const handleTimeConfirm = (timeString) => {
    if (currentMealType) {
      setTimeState((prev) => ({
        ...prev,
        [`${currentTimeKey}Times`]: {
          ...prev[`${currentTimeKey}Times`],
          [currentMealType]: timeString,
        },
      }));
    } else {
      setTimeState((prev) => ({
        ...prev,
        [`${currentTimeKey}Time`]: timeString,
      }));
    }
    setPickerVisible(false);
  };

  const getTimeForKey = (key, mealType = null) => {
    if (mealType) {
      return timeState[`${key}Times`]?.[mealType] ?? '08:00';
    }
    return timeState[`${key}Time`] ?? '07:00';
  };

  const handleSave = async () => {
    try {
      const allSettings = { ...notiState, ...timeState };
      console.log('handleSave: allSettings =', allSettings);
      updateSettings({ notifications: allSettings });
      await applyNotificationSettings({ notifications: allSettings });
      Alert.alert('บันทึกสำเร็จ', 'ตั้งค่าการแจ้งเตือนถูกอัปเดตแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('handleSave error:', err);
      Alert.alert('ข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกได้');
    }
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
              <View>
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
                {item.scheduleable && notiState[item.key] && (
                  <View style={styles.timePickerRow}>
                    {item.hasMultipleTimes ? (
                      <>
                        <TouchableOpacity
                          style={styles.timeBtn}
                          onPress={() => openTimePicker(item.key, 'breakfast')}
                        >
                          <Ionicons name="sunny-outline" size={14} color={GREEN} />
                          <Text style={styles.timeBtnText}>{getTimeForKey(item.key, 'breakfast')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.timeBtn}
                          onPress={() => openTimePicker(item.key, 'lunch')}
                        >
                          <Ionicons name="sunny-outline" size={14} color={GREEN} />
                          <Text style={styles.timeBtnText}>{getTimeForKey(item.key, 'lunch')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.timeBtn}
                          onPress={() => openTimePicker(item.key, 'dinner')}
                        >
                          <Ionicons name="moon-outline" size={14} color={GREEN} />
                          <Text style={styles.timeBtnText}>{getTimeForKey(item.key, 'dinner')}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.timeBtn}
                        onPress={() => openTimePicker(item.key)}
                      >
                        <Ionicons name="time-outline" size={14} color={GREEN} />
                        <Text style={styles.timeBtnText}>{getTimeForKey(item.key)}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
              {Boolean(index < NOTI_ITEMS.length - 1) && <View style={styles.divider} />}
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

      <NotificationTimePicker
        visible={pickerVisible}
        initialTime={
          currentMealType
            ? getTimeForKey(currentTimeKey, currentMealType)
            : getTimeForKey(currentTimeKey)
        }
        onConfirm={handleTimeConfirm}
        onClose={() => setPickerVisible(false)}
        title={
          currentMealType
            ? `เลือกเวลา (${currentMealType === 'breakfast' ? 'เช้า' : currentMealType === 'lunch' ? 'เที่ยง' : 'เย็น'})`
            : 'เลือกเวลา'
        }
      />

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
  timePickerRow: {
    flexDirection: 'row', gap: 8, marginTop: 8, marginLeft: 46, flexWrap: 'wrap',
  },
  timeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: '#F5F5F5', borderRadius: 20,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  timeBtnText: { fontSize: 13, fontWeight: '600', color: GREEN },
});