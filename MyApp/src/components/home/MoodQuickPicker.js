import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Modal, Pressable, Animated,
} from 'react-native';
import { MOODS } from '../../constants/moods';

const MOOD_META = {
  rad:   { label: 'สุดยอด', color: '#F59E0B', bg: '#FFFBEB' },
  good:  { label: 'ดี',     color: '#22C55E', bg: '#F0FDF4' },
  meh:   { label: 'เฉยๆ',  color: '#94A3B8', bg: '#F8FAFC' },
  sad:   { label: 'เศร้า',  color: '#60A5FA', bg: '#EFF6FF' },
  awful: { label: 'แย่',    color: '#F87171', bg: '#FEF2F2' },
};

export default function MoodQuickPicker({ visible, onSelect, onClose }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (key) => {
    setSelected(key);
  };

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
    setSelected(null);
  };

  const handleClose = () => {
    setSelected(null);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title */}
        <Text style={styles.title}>วันนี้รู้สึกยังไงบ้าง?</Text>
        <Text style={styles.subtitle}>แตะเพื่อเลือกอารมณ์ของคุณ</Text>

        {/* Mood Grid */}
        <View style={styles.moodRow}>
          {MOODS.map(({ key, image }) => {
            const meta = MOOD_META[key];
            const isSelected = selected === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.moodItem,
                  isSelected && { backgroundColor: meta.bg, borderColor: meta.color, borderWidth: 2 },
                ]}
                onPress={() => handleSelect(key)}
                activeOpacity={0.75}
              >
                <View style={[
                  styles.iconWrap,
                  isSelected && { transform: [{ scale: 1.15 }] },
                ]}>
                  <Image source={image} style={styles.icon} />
                </View>
                <Text style={[
                  styles.moodLabel,
                  { color: isSelected ? meta.color : '#AAA' },
                  isSelected && { fontWeight: '700' },
                ]}>
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected feedback */}
        {selected && (
          <View style={[styles.feedbackBar, { backgroundColor: MOOD_META[selected].bg }]}>
            <Text style={[styles.feedbackText, { color: MOOD_META[selected].color }]}>
              {MOOD_META[selected].label} — บันทึกอารมณ์วันนี้
            </Text>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            {
              backgroundColor: selected ? MOOD_META[selected].color : '#E5E7EB',
            },
          ]}
          onPress={handleConfirm}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={[
            styles.confirmText,
            { color: selected ? '#fff' : '#9CA3AF' },
          ]}>
            บันทึก
          </Text>
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodItem: {
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 60,
  },
  iconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  feedbackBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
  },
});