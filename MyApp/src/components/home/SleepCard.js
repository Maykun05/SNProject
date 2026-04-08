import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SleepQuickPicker from './SleepQuickPicker';

/**
 * SleepCard
 * วางแทน card "เมื่อคืนคุณนอนกี่ชั่วโมง?" ในหน้าหลัก
 * กดที่ card ใดก็ได้ → SleepQuickPicker pop up ขึ้นมา
 *
 * Props:
 *   sleepHours  : number | null   ค่าที่บันทึกไว้แล้ว (จาก state ของ parent)
 *   onSave      : (hours) => void  callback เมื่อ user กดบันทึก
 */
export default function SleepCard({ sleepHours, onSave }) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const displayText = sleepHours != null
    ? `${sleepHours.toFixed(1)} ชม.`
    : '—';

  return (
    <>
      {/* ── Card กดแล้ว pop up ── */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => setPickerVisible(true)}
        activeOpacity={0.82}
      >
        <Text style={styles.question}>เมื่อคืนคุณนอนกี่ชั่วโมง?</Text>
        <Text style={styles.value}>{displayText}</Text>

        <View style={styles.sliderDummy}>
          <View style={[
            styles.sliderFill,
            { flex: sleepHours ? Math.min(sleepHours / 10, 1) : 0.6 }
          ]} />
          <View style={styles.sliderThumb} />
        </View>

        <Text style={styles.tapHint}>แตะเพื่อแก้ไข</Text>
      </TouchableOpacity>

      {/* ── Modal ── */}
      <SleepQuickPicker
        visible={pickerVisible}
        initialHours={sleepHours ? Math.floor(sleepHours) : 7}
        onSelect={(hours) => {
          onSave(hours);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#8aaa7a',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    gap: 8,
  },
  question: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  sliderDummy: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    overflow: 'visible',
  },
  sliderFill: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 3,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginLeft: -10,
  },
  tapHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
});