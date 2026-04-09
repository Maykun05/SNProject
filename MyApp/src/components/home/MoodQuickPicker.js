import React from 'react';
import { View,TouchableOpacity, StyleSheet, Image, 
  Pressable, Modal } from 'react-native';
import { MOODS } from '../../constants/moods';

export default function MoodQuickPicker({ visible, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* พื้นหลังคลิกเพื่อปิด */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* กันไม่ให้กดทะลุ bar */}
        <View style={styles.bar}>
          {MOODS.map(({ key, image }) => (
            <TouchableOpacity key={key} onPress={() => onSelect(key)}>
              <Image source={image} style={styles.icon} />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
      flex: 1,
      justifyContent: 'center', // แถบอยู่ด้านล่าง
      backgroundColor: 'rgba(0,0,0,0.3)', // พื้นหลังโปร่งใส
    },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgb(255, 255, 255)',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});