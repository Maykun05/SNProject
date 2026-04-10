import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

/**
 * การ์ดแก้ไขเป้าหมายกิจกรรม (walk/run/bike/gym) — ปุ่มยกเลิก + บันทึกเท่านั้น
 */
export default function ExerciseGoalEditModal({
  visible,
  activityLabel,
  defaultSummaryHint,
  labelA,
  labelB,
  valueA,
  valueB,
  onChangeA,
  onChangeB,
  onCancel,
  onSave,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            แก้ไขเป้าหมาย{activityLabel ? ` — ${activityLabel}` : ''}
          </Text>
          {defaultSummaryHint ? (
            <Text style={styles.hint}>ค่าแนะนำ: {defaultSummaryHint}</Text>
          ) : null}
          <Text style={styles.fieldLabel}>{labelA}</Text>
          <TextInput
            style={styles.input}
            value={valueA}
            onChangeText={onChangeA}
            keyboardType="numeric"
            placeholder={valueA}
          />
          <Text style={styles.fieldLabel}>{labelB}</Text>
          <TextInput
            style={styles.input}
            value={valueB}
            onChangeText={onChangeB}
            keyboardType="numeric"
            placeholder={valueB}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onCancel}>
              <Text style={styles.btnGhostText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onSave}>
              <Text style={styles.btnPrimaryText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#23413A',
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: '#78909C',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#455A64',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
  },
  btnGhostText: {
    fontWeight: '700',
    color: '#546E7A',
  },
  btnPrimary: {
    backgroundColor: '#2E7D5B',
  },
  btnPrimaryText: {
    fontWeight: '800',
    color: '#fff',
  },
});
