import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const GREEN = '#1E4D2B';

export default function NotificationTimePicker({ visible, initialTime, onConfirm, onClose, title }) {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (initialTime && typeof initialTime === 'string') {
      const [h, m] = initialTime.split(':').map(Number);
      setHour(h || 7);
      setMinute(m || 0);
    }
  }, [initialTime, visible]);

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShow(false);
      onClose();
      return;
    }
    if (selectedDate) {
      setHour(selectedDate.getHours());
      setMinute(selectedDate.getMinutes());
    }
  };

  const handleConfirm = () => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onConfirm(timeString);
    setShow(false);
    onClose();
  };

  const timeDate = new Date();
  timeDate.setHours(hour, minute, 0, 0);

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <View style={s.container}>
          <View style={s.card}>
            <Text style={s.title}>{title || 'เลือกเวลา'}</Text>

            <View style={s.timeDisplay}>
              <Text style={s.timeText}>
                {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
              </Text>
            </View>

            <DateTimePicker
              value={timeDate}
              mode="time"
              display="spinner"
              onChange={handleDateChange}
              textColor={GREEN}
            />

            <View style={s.buttonRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={s.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
                <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={s.confirmBtnText}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 20,
  },
  timeDisplay: {
    marginBottom: 16,
    backgroundColor: 'rgba(30, 77, 43, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '800',
    color: GREEN,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
