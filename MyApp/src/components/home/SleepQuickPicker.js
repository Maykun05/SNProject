import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, } from 'react-native';

const SLIDER_WIDTH = 260;

export default function SleepQuickPicker({ visible, onSelect }) {
  /* 🔥 Hooks ต้องอยู่บนสุดเสมอ */
  const [hours, setHours] = useState(6);
  const thumbX = useRef((6 / 10) * SLIDER_WIDTH);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        let x = Math.min(
          SLIDER_WIDTH,
          Math.max(0, thumbX.current + g.dx)
        );
        const value = (x / SLIDER_WIDTH) * 10;
        setHours(Number(value.toFixed(1)));
      },
      onPanResponderRelease: () => {
        thumbX.current = (hours / 10) * SLIDER_WIDTH;
      },
    })
  ).current;

  /* 🔥 return หลังจาก hook ครบแล้วเท่านั้น */
  if (!visible) return null;

  const getSleepKey = (h) => {
    if (h < 3) return 'less3';
    if (h < 7) return '3to7';
    if (h <= 8) return '7to8';
    return 'more8';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เมื่อคืนคุณนอนกี่ชั่วโมง?</Text>

      <Text style={styles.value}>{hours.toFixed(1)} ชม.</Text>

      <View style={styles.slider}>
        <View style={styles.track} />
        <View
          style={[
            styles.thumb,
            { left: (hours / 10) * SLIDER_WIDTH - 10 },
          ]}
          {...panResponder.panHandlers}
        />
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => onSelect(getSleepKey(hours))}
        >
        <Text style={styles.confirmText}>บันทึกการนอน</Text>
        </TouchableOpacity>

      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#abb9a7ff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  slider: {
    width: SLIDER_WIDTH,
    height: 30,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 7,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  thumb: {
    position: 'absolute',
    top: 5,
    width: 25,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgb(67, 79, 64)',
  },
  confirmButton: {
    marginTop: 20,
    borderWidth: 2,                 
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },

});
