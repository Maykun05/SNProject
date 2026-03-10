import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MOODS } from '../constants/moods';

export default function MoodPickerModal({
  visible,
  onSelect,
  onClose,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal}>
          {Object.entries(MOODS).map(([key, emoji]) => (
            <TouchableOpacity
              key={key}
              onPress={() => onSelect(key)}
              style={styles.item}
            >
              <Text style={styles.emoji}>{emoji}</Text>
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
  emoji: {
    fontSize: 32,
  },
});
