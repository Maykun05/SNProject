import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Image, Modal, Pressable
} from 'react-native';
import { MOODS } from '../../constants/moods';

export default function MoodQuickPicker({ visible, value, onSelect, onClose }) {
  const [selected, setSelected] = useState(value);
  useEffect(() => {
    if (visible) {
      setSelected(value);
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      
      {/* backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* content */}
      <View style={styles.sheet}>
        <Text style={styles.title}>วันนี้รู้สึกยังไง?</Text>

        <View style={styles.row}>
          {MOODS.map(({ key, image }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.item,
                selected === key && styles.selected
              ]}
              onPress={() => setSelected(key)}
            >
              <Image source={image} style={styles.icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* confirm */}
        <TouchableOpacity
          style={[
            styles.btn,
            { opacity: selected ? 1 : 0.4 }
          ]}
          disabled={!selected}
          onPress={() => {
            onSelect(selected);
            onClose?.();
          }}
        >
          <Text style={styles.btnText}>บันทึก</Text>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000040',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 45,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  item: {
    padding: 8,
    borderRadius: 16,
  },
  selected: {
    backgroundColor: '#EEF2FF',
  },
  icon: {
    width: 40,
    height: 40,
  },
  btn: {
    backgroundColor: '#6366F1',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});