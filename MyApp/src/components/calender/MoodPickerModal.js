import React from 'react';
import {
  Modal,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MOODS } from '../../constants/moods';

export default function MoodPickerModal({
  visible,
  onSelect,
  onClose,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal}>
          {MOODS.map(({ key, image }) => (
            <TouchableOpacity
              key={key}
              onPress={() => onSelect(key)}
              style={styles.item}
            >
              <Image source={image} style={styles.icon} />
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
  },
  item: {
    marginHorizontal: 8,
  },
  image: {
    width: 40,
    height: 40,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
