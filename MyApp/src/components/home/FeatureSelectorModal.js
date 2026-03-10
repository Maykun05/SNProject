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
  enabledFeatures,
  onToggle,
  onClose,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>เลือกฟีเจอร์</Text>

          {features.map(f => {
            const enabled = enabledFeatures[f.key] !== false;

            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => onToggle(f.key)}
                style={styles.row}
                activeOpacity={0.7}
              >
                {/* indicator */}
                <View
                  style={[
                    styles.check,
                    enabled && styles.checkActive,
                  ]}
                />

                <Text style={styles.label}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>ปิด</Text>
          </TouchableOpacity>
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

  /* ===== แถวฟีเจอร์ ===== */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,   // 👈 ระยะห่างบน-ล่าง
  },

  label: {
    fontSize: 17,
  },

  /* ===== วงกลมแทนติ๊ก ===== */
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
  },

  checkActive: {
    backgroundColor: '#2EC4B6', // 👈 สีที่คุณต้องการ
    borderColor: '#2EC4B6',
  },

  close: {
    marginTop: 16,
    alignSelf: 'flex-end',
  },

  closeText: {
    color: '#2EC4B6',
    fontWeight: '600',
  },
});
