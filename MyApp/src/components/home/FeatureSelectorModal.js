import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';

const SCREEN_H = Dimensions.get('window').height;

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
          <Text style={styles.title}>แก้ไขฟีเจอร์ที่สนใจ</Text>

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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: SCREEN_H * 0.22,
  },

  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 25,
    width: '80%',
    maxWidth: 400,
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
    height: 50,
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 10,
  },

  rowActive: {
    backgroundColor: '#abb9a7ff',
    borderRadius: 30,
  },

  label: {
    fontSize: 16,
    color: '#333',
  },

  labelActive: {
    color: '#000000',
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
    backgroundColor: '#2D4F45',
    borderColor: 'rgb(150, 150, 150)',
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
    color: '#2D4F45',
    fontWeight: 'bold',
    fontSize: 14,
  },
});