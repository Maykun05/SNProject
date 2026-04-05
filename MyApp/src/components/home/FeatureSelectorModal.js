import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';

export default function FeatureSelectorModal({
  visible,
  features,
  enabledFeatures,   // ✅ ใช้ map ของ key → true/false
  onToggle,          // ✅ toggle ทีละตัว
  onClose,
  onSave,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>เลือกฟีเจอร์</Text>

          {features.map(f => {
            const active = enabledFeatures[f.key]; // ✅ ใช้ key

            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => onToggle(f.key)}   // ✅ toggle ด้วย key
                style={[styles.row, active && styles.rowActive]}
              >
                <View style={[styles.check, active && styles.checkActive]} />
                <Text style={[styles.label, active && styles.labelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave}>
              <Text style={styles.saveText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '80%',
  },

  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },

  /* ===== แถว ===== */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  rowActive: {
    backgroundColor: '#E6F7F5', // 🔥 เขียวอ่อน
  },

  label: {
    fontSize: 16,
    color: '#333',
  },

  labelActive: {
    color: '#2EC4B6',
    fontWeight: '600',
  },

  /* ===== วงกลม ===== */
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
  },

  checkActive: {
    backgroundColor: '#2EC4B6',
    borderColor: '#2EC4B6',
  },

  /* ===== ปุ่ม ===== */
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 16,
  },

  cancelText: {
    color: '#888',
    fontSize: 14,
  },

  saveText: {
    color: '#2EC4B6',
    fontWeight: 'bold',
    fontSize: 14,
  },
});