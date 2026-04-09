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

export default function WaterGoalModal({
  visible,
  onClose,
  recommendedWater,
  waterGoal,
  onSave,
}) {
  const [inputGoal, setInputGoal] = useState(String(waterGoal));
  const [saving, setSaving] = useState(false);

  const presetGoals = [...new Set([recommendedWater, 2000, 2500, 3000].map((x) => Math.round(x)))].sort(
    (a, b) => a - b
  );

  useEffect(() => {
    if (visible) setInputGoal(String(waterGoal));
  }, [visible, waterGoal]);

  const handleSave = async () => {
    const parsed = parseInt(inputGoal, 10);
    if (Number.isNaN(parsed) || parsed < 500) {
      Alert.alert('ค่าไม่ถูกต้อง', 'กรุณากรอกปริมาณน้ำอย่างน้อย 500 มล.');
      return;
    }
    if (parsed > 10000) {
      Alert.alert('ค่าไม่ถูกต้อง', 'ปริมาณน้ำไม่ควรเกิน 10,000 มล.');
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed);
      onClose();
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
            <Ionicons name="flag-outline" size={24} color="#1565C0" />
            <Text style={styles.title}>ตั้งเป้าหมายน้ำ</Text>
          </View>
          <Text style={styles.sub}>แนะนำจากโปรไฟล์: {recommendedWater} มล.</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={inputGoal}
              onChangeText={setInputGoal}
              keyboardType="number-pad"
              placeholder="มล."
              placeholderTextColor="#bbb"
              maxLength={5}
            />
            <Text style={styles.unit}>มล.</Text>
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
  title: { fontSize: 18, fontWeight: '800', color: '#0D47A1' },
  sub: { fontSize: 13, color: '#78909C' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BBDEFB',
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
  presetOn: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  presetTxt: { fontSize: 14, fontWeight: '600', color: '#546E7A' },
  presetTxtOn: { color: '#FFF' },
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
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okTxt: { fontSize: 15, color: '#FFF', fontWeight: '800' },
});
