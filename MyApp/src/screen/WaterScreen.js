import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressRing from '../component/ProgressRing';
import { useWater } from '../context/WaterContext'; // ✅ เพิ่ม

const WaterScreen = ({ route, navigation }) => {
  const { weight } = route.params || { weight: 60 };
  const recommendedWater = weight * 30;

  // ✅ ดึงจาก Context แทน useState
  const { consumed, waterGoal, setWaterGoal, addWater } = useWater();

  const [amountToAdd, setAmountToAdd]     = useState(100);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [inputGoal, setInputGoal]         = useState(String(waterGoal));

  const handleSaveWater = () => {
    if (consumed >= waterGoal) {
      Alert.alert('เกินปริมาณ', 'คุณดื่มน้ำครบตามเป้าหมายแล้ว');
      return;
    }
    addWater(amountToAdd); // ✅ ใช้ addWater จาก Context
  };

  const handleSaveGoal = () => {
    const parsed = parseInt(inputGoal);
    if (isNaN(parsed) || parsed < 500) {
      Alert.alert('ค่าไม่ถูกต้อง', 'กรุณากรอกปริมาณน้ำอย่างน้อย 500 มล.');
      return;
    }
    if (parsed > 10000) {
      Alert.alert('ค่าไม่ถูกต้อง', 'ปริมาณน้ำไม่ควรเกิน 10,000 มล.');
      return;
    }
    setWaterGoal(parsed); // ✅ ใช้ setWaterGoal จาก Context
    setShowGoalModal(false);
  };

  return (
    <View style={styles.container}>

      {/* ── Recommendation ── */}
      <View style={styles.recommendContainer}>
        <Text style={styles.recommendTitle}>ปริมาณน้ำที่แนะนำสำหรับคุณ</Text>
        <Text style={styles.recommendValue}>ประมาณ {recommendedWater} มล. ต่อวัน</Text>
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>เป้าหมาย {waterGoal} มล.</Text>
          <TouchableOpacity
            style={styles.editGoalBtn}
            onPress={() => { setInputGoal(String(waterGoal)); setShowGoalModal(true); }}
          >
            <Ionicons name="pencil" size={16} color="#E8A020" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Progress Ring ── */}
      <ProgressRing consumed={consumed} recommended={waterGoal} />

      {/* ── Controller ── */}
      <View style={styles.controller}>
        <View style={styles.amountDisplay}>
          <Text style={styles.amountText}>{amountToAdd} ml</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setAmountToAdd(prev => Math.max(50, prev - 50))}
          >
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setAmountToAdd(prev => prev + 50)}
          >
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveContainer} onPress={handleSaveWater}>
            <Ionicons name="water" size={32} color="#4A90E2" />
            <Text style={styles.saveLabel}>save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── History ── */}
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => navigation.navigate('WaterHistory')}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          <Text style={styles.arrow}>{'>'}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.historyItem}>
            <Text>วันนี้คุณดื่มน้ำไปแล้ว {consumed} มล.</Text>
          </View>
        </ScrollView>
      </TouchableOpacity>

      {/* ── Modal ── */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="water" size={24} color="#4A90E2" />
              <Text style={styles.modalTitle}>ตั้งเป้าหมายน้ำ</Text>
            </View>
            <Text style={styles.modalSubtitle}>ค่าที่แนะนำสำหรับคุณคือ {recommendedWater} มล.</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputGoal}
                onChangeText={setInputGoal}
                keyboardType="number-pad"
                placeholder="กรอกปริมาณน้ำ"
                placeholderTextColor="#bbb"
                maxLength={5}
              />
              <Text style={styles.inputUnit}>มล.</Text>
            </View>
            <Text style={styles.presetLabel}>เลือกค่าสำเร็จรูป</Text>
            <View style={styles.presetRow}>
              {[1500, 2000, 2500, 3000].map(val => (
                <TouchableOpacity
                  key={val}
                  style={[styles.presetBtn, String(val) === inputGoal && styles.presetBtnActive]}
                  onPress={() => setInputGoal(String(val))}
                >
                  <Text style={[styles.presetText, String(val) === inputGoal && styles.presetTextActive]}>
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowGoalModal(false)}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveGoal}>
                <Text style={styles.confirmBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

// styles เหมือนเดิมทุกอย่าง ไม่ต้องเปลี่ยน
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 20, alignItems: 'center' },
  recommendContainer: { marginBottom: 10, alignItems: 'center' },
  recommendTitle: { fontSize: 18, color: '#2E7D32', fontWeight: '500', textAlign: 'center' },
  recommendValue: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20', marginVertical: 4, textAlign: 'center' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  goalText: { fontSize: 14, color: '#444' },
  editGoalBtn: { padding: 4 },
  controller: { alignItems: 'center', marginVertical: 20 },
  amountDisplay: { backgroundColor: '#C5E3F6', paddingHorizontal: 60, paddingVertical: 12, borderRadius: 25, marginBottom: 15 },
  amountText: { fontSize: 22, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  circleBtn: { backgroundColor: '#A3C1AD', width: 70, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 24, fontWeight: 'bold' },
  saveContainer: { alignItems: 'center' },
  saveLabel: { fontSize: 10, color: '#333', fontWeight: 'bold' },
  historyCard: { width: '90%', flex: 1, backgroundColor: '#DBE4E0', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, marginTop: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  historyTitle: { fontSize: 20, fontWeight: 'bold' },
  arrow: { fontSize: 20 },
  historyItem: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, gap: 14, elevation: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
  modalSubtitle: { fontSize: 13, color: '#888' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14, borderWidth: 1.5, borderColor: '#E0E0E0', paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 22, fontWeight: 'bold', color: '#222', paddingVertical: 12, textAlign: 'center' },
  inputUnit: { fontSize: 16, color: '#888', marginLeft: 6 },
  presetLabel: { fontSize: 12, color: '#999', marginBottom: -4 },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: { flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#F9F9F9' },
  presetBtnActive: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  presetText: { fontSize: 13, fontWeight: '600', color: '#666' },
  presetTextActive: { color: '#FFF' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 30, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#999', fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: 13, borderRadius: 30, backgroundColor: '#1B5E20', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, color: '#FFF', fontWeight: 'bold' },
});

export default WaterScreen;