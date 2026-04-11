import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';

const DEFAULT_ML = [250, 500, 700, 1500];
const MIN_ML = 1;
const MAX_ML = 5000;

export default function WaterQuickPick({ amounts = DEFAULT_ML, onPick }) {
  const [custom, setCustom] = useState('');

  const submitCustom = () => {
    const n = parseInt(String(custom).replace(/\D/g, ''), 10);
    if (!Number.isFinite(n) || n < MIN_ML || n > MAX_ML) {
      Alert.alert('จำนวนไม่ถูกต้อง', `กรอกตัวเลข ${MIN_ML}–${MAX_ML} มล.`);
      return;
    }
    onPick(n);
    setCustom('');
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>เพิ่มน้ำ</Text>
      <View style={styles.row}>
        {amounts.map((ml) => (
          <TouchableOpacity key={ml} style={styles.chip} onPress={() => onPick(ml)} activeOpacity={0.85}>
            <Text style={styles.chipText}>+{ml}</Text>
            <Text style={styles.chipUnit}>มล.</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, styles.labelSecond]}>หรือพิมพ์มล.</Text>
      <View style={styles.customRow}>
        <TextInput
          style={styles.input}
          value={custom}
          onChangeText={setCustom}
          keyboardType="number-pad"
          placeholder="เช่น 175"
          placeholderTextColor="#B0BEC5"
          maxLength={4}
        />
        <TouchableOpacity style={styles.addBtn} onPress={submitCustom} activeOpacity={0.9}>
          <Text style={styles.addBtnText}>เพิ่ม</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#78909C', marginBottom: 10 },
  labelSecond: { marginTop: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    alignItems: 'center',
    minWidth: 72,
  },
  chipText: { fontSize: 17, fontWeight: '800', color: '#0D47A1' },
  chipUnit: { fontSize: 11, fontWeight: '600', color: '#1565C0', marginTop: 2 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#BBDEFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#0D47A1',
    backgroundColor: '#FFF',
  },
  addBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1565C0',
  },
  addBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
