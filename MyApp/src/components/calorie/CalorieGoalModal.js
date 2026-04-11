import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MIN_KCAL = 800;
const MAX_KCAL = 8000;

/** โทนเดียวกับการ์ดแคลอรี่หน้าแรก / CalorieScreen */
const CAL = {
  main: '#B85C14',
  accent: '#D9781C',
  border: 'rgba(30, 77, 43, 0.12)',
  soft: '#FDF6EF',
  inputBorder: 'rgba(184, 92, 20, 0.35)',
};

export default function CalorieGoalModal({
  visible,
  onClose,
  recommendedDaily,
  calorieGoal,
  onSave,
  onUseRecommended,
  hasCustomGoal,
}) {
  const [inputGoal, setInputGoal] = useState(String(calorieGoal));
  const [saving, setSaving] = useState(false);

  const rawPresets = [recommendedDaily, 1500, 1800, 2000, 2200, 2500]
    .map((x) => Math.round(Number(x) || 0))
    .filter((x) => x >= MIN_KCAL && x <= MAX_KCAL);
  let presetGoals = [...new Set(rawPresets)].sort((a, b) => a - b);
  if (presetGoals.length === 0) presetGoals = [2000];

  useEffect(() => {
    if (visible) setInputGoal(String(calorieGoal));
  }, [visible, calorieGoal]);

  const handleSave = async () => {
    const parsed = parseInt(inputGoal, 10);
    if (Number.isNaN(parsed) || parsed < MIN_KCAL) {
      Alert.alert('ค่าไม่ถูกต้อง', `กรุณากรอกอย่างน้อย ${MIN_KCAL} kcal`);
      return;
    }
    if (parsed > MAX_KCAL) {
      Alert.alert('ค่าไม่ถูกต้อง', `ไม่ควรเกิน ${MAX_KCAL} kcal`);
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed);
      onClose();
    } catch (e) {
      Alert.alert('ไม่สำเร็จ', e?.message || 'บันทึกเป้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleUseRecommended = async () => {
    setSaving(true);
    try {
      await onUseRecommended();
      onClose();
    } catch (e) {
      Alert.alert('ไม่สำเร็จ', e?.message || 'ล้างเป้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.box}>
          <View style={styles.header}>
            <Ionicons name="nutrition-outline" size={24} color={CAL.main} />
            <Text style={styles.title}>ตั้งเป้าแคลอรี่</Text>
          </View>
          <Text style={styles.sub}>แนะนำจากโปรไฟล์: {recommendedDaily} kcal/วัน</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={inputGoal}
              onChangeText={setInputGoal}
              keyboardType="number-pad"
              placeholder="kcal"
              placeholderTextColor="#bbb"
              maxLength={5}
            />
            <Text style={styles.unit}>kcal</Text>
          </View>
          <Text style={styles.presetLabel}>ค่าสำเร็จรูป</Text>
          <View style={styles.presetRow}>
            {presetGoals.map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.preset, String(val) === inputGoal && styles.presetOn]}
                onPress={() => setInputGoal(String(val))}
              >
                <Text style={[styles.presetTxt, String(val) === inputGoal && styles.presetTxtOn]}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {hasCustomGoal ? (
            <TouchableOpacity style={styles.resetRow} onPress={handleUseRecommended} disabled={saving}>
              <Text style={styles.resetTxt}>ใช้ค่าจากสูตรแทน (ล้างเป้าที่ตั้งเอง)</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.btns}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelTxt}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ok, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.okTxt}>บันทึก</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  box: { width: '88%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: CAL.main },
  sub: { fontSize: 13, color: '#78909C' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CAL.soft,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CAL.inputBorder,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 22, fontWeight: '800', color: '#263238', paddingVertical: 12, textAlign: 'center' },
  unit: { fontSize: 16, color: '#78909C', marginLeft: 6 },
  presetLabel: { fontSize: 12, color: '#90A4AE', marginTop: 4 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  presetOn: { backgroundColor: CAL.accent, borderColor: CAL.accent },
  presetTxt: { fontSize: 14, fontWeight: '600', color: '#546E7A' },
  presetTxtOn: { color: '#FFF' },
  resetRow: { paddingVertical: 8 },
  resetTxt: { fontSize: 13, color: CAL.main, fontWeight: '700', textAlign: 'center' },
  btns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelTxt: { fontSize: 15, color: '#90A4AE', fontWeight: '600' },
  ok: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: CAL.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okTxt: { fontSize: 15, color: '#FFF', fontWeight: '800' },
});
