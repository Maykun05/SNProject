import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, TextInput, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

const GREEN = '#1E4D2B';

export default function EditGoalsScreen({ navigation }) {
  const { profile, updateGoals } = useProfile();

  const [dailyStep, setDailyStep]   = useState(String(profile.goals?.dailyStep  ?? 5000));
  const [weeklyStep, setWeeklyStep] = useState(String(profile.goals?.weeklyStep ?? 15000));

  const DAILY_PRESETS  = [3000, 5000, 8000, 10000];
  const WEEKLY_PRESETS = [10000, 15000, 25000, 50000];

  const validateSteps = () => {
    const daily  = parseInt(dailyStep);
    const weekly = parseInt(weeklyStep);
    if (isNaN(daily) || daily < 1000) {
      Alert.alert('ค่าไม่ถูกต้อง', 'เป้าหมายรายวันต้องไม่น้อยกว่า 1,000 ก้าว');
      return false;
    }
    if (isNaN(weekly) || weekly < daily) {
      Alert.alert('ค่าไม่ถูกต้อง', 'เป้าหมายรายสัปดาห์ต้องมากกว่าเป้าหมายรายวัน');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateSteps()) return;

    // ✅ ใช้ updateGoals() ตรงจาก ProfileContext
    updateGoals({
      dailyStep:  parseInt(dailyStep),
      weeklyStep: parseInt(weeklyStep),
    });
    Alert.alert('บันทึกสำเร็จ', 'เป้าหมายของคุณถูกอัปเดตแล้ว', [
      { text: 'ตกลง', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ตั้งค่าเป้าหมาย</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── เป้าหมายรายวัน ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="footsteps-outline" size={20} color={GREEN} />
            <Text style={styles.sectionTitle}>เป้าหมายก้าวเดินรายวัน</Text>
          </View>

          {/* Preset buttons */}
          <View style={styles.presetRow}>
            {DAILY_PRESETS.map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.presetBtn,
                  String(val) === dailyStep && styles.presetBtnActive,
                ]}
                onPress={() => setDailyStep(String(val))}
              >
                <Text style={[
                  styles.presetText,
                  String(val) === dailyStep && styles.presetTextActive,
                ]}>
                  {val.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="walk-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={dailyStep}
              onChangeText={setDailyStep}
              keyboardType="number-pad"
              placeholder="กรอกจำนวนก้าว"
              placeholderTextColor="#bbb"
            />
            <Text style={styles.inputUnit}>ก้าว</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── เป้าหมายรายสัปดาห์ ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color={GREEN} />
            <Text style={styles.sectionTitle}>เป้าหมายรายสัปดาห์</Text>
          </View>

          {/* Preset buttons */}
          <View style={styles.presetRow}>
            {WEEKLY_PRESETS.map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.presetBtn,
                  String(val) === weeklyStep && styles.presetBtnActive,
                ]}
                onPress={() => setWeeklyStep(String(val))}
              >
                <Text style={[
                  styles.presetText,
                  String(val) === weeklyStep && styles.presetTextActive,
                ]}>
                  {val.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="trending-up-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={weeklyStep}
              onChangeText={setWeeklyStep}
              keyboardType="number-pad"
              placeholder="กรอกจำนวนก้าว"
              placeholderTextColor="#bbb"
            />
            <Text style={styles.inputUnit}>ก้าว</Text>
          </View>
        </View>

        {/* ── ปุ่มบันทึก ── */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
          <Text style={styles.saveBtnText}>บันทึกเป้าหมาย</Text>
        </TouchableOpacity>

        {/* ── ปุ่มยกเลิก ── */}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>ยกเลิก</Text>
        </TouchableOpacity>

      </ScrollView>
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
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: GREEN,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 4,
  },

  /* ── Preset Buttons ── */
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    alignItems: 'center',
    elevation: 1,
  },
  presetBtnActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  presetTextActive: {
    color: '#FFF',
  },

  /* ── Input ── */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 14,
  },
  inputUnit: {
    fontSize: 14,
    color: '#888',
    marginLeft: 6,
  },

  /* ── Buttons ── */
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 10,
    gap: 8,
    elevation: 4,
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#999',
  },
});