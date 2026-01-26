import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOODS = {
  rad: '😆',
  good: '🙂',
  meh: '😐',
  bad: '😞',
  awful: '😵',
};

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moods, setMoods] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /* ===== เลื่อนเดือน ===== */
  const goPrevMonth = () => {
    setCurrentDate(
      prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    if (next <= new Date()) {
      setCurrentDate(next);
    }
  };

  /* ===== เลือก / แก้ mood ===== */
  const onSelectMood = mood => {
    setMoods(prev => ({
      ...prev,
      [selectedDate]: mood, // overwrite ค่าเดิมได้
    }));
    setSelectedDate(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth}>
          <Text style={styles.arrow}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {currentDate.toLocaleString('th-TH', { month: 'long' })}{' '}
          {year + 543}
        </Text>

        <TouchableOpacity onPress={goNextMonth}>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* ===== Calendar ===== */}
      <View style={styles.grid}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateObj = new Date(year, month, day);
          dateObj.setHours(0, 0, 0, 0);

          const dateKey = dateObj.toISOString().slice(0, 10);
          const isPastOrToday = dateObj <= today;
          const isToday = dateObj.getTime() === today.getTime();
          const mood = moods[dateKey];

          return (
            <View key={day} style={styles.dayCell}>
              <TouchableOpacity
                disabled={!isPastOrToday}
                onPress={() => {
                  if (isPastOrToday) {
                    setSelectedDate(dateKey); // 👈 กดได้เสมอ
                  }
                }}
                style={[
                  styles.dayCircle,
                  isToday && styles.todayCircle,
                  !isPastOrToday && styles.disabled,
                ]}
              >
                {mood ? (
                  <Text style={styles.emoji}>{MOODS[mood]}</Text>
                ) : isPastOrToday ? (
                  <Text style={styles.plus}>+</Text>
                ) : null}
              </TouchableOpacity>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          );
        })}
      </View>

      {/* ===== Mood Picker ===== */}
      <Modal transparent visible={!!selectedDate} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedDate(null)}
        >
          <Pressable style={styles.modal}>
            {Object.entries(MOODS).map(([key, emoji]) => (
              <TouchableOpacity
                key={key}
                onPress={() => onSelectMood(key)}
              >
                <Text style={styles.modalEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ======================
   STYLES
====================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  arrow: {
    fontSize: 22,
    color: '#2EC4B6',
    paddingHorizontal: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    marginVertical: 8,
  },

  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  todayCircle: {
    borderWidth: 2,
    borderColor: '#2EC4B6',
  },

  disabled: {
    opacity: 0.3,
  },

  emoji: {
    fontSize: 20,
  },

  plus: {
    fontSize: 20,
    color: '#666',
  },

  dayText: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },

  modalOverlay: {
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

  modalEmoji: {
    fontSize: 32,
    marginHorizontal: 8,
  },
});
