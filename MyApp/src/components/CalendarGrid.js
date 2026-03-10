import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOODS } from '../constants/moods';
import { getLocalDateKey } from '../utils/dateUtils';

/* ===== utils ===== */
const getEmptyDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  return (firstDay + 6) % 7; // เริ่มวันจันทร์
};

export default function CalendarGrid({
  year,
  month,
  moods,
  onSelectDate,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const emptyDays = getEmptyDays(year, month);

  return (
    <>
      {/* ===== Day Names ===== */}
      <View style={styles.weekRow}>
        {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map(d => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      {/* ===== Calendar Grid ===== */}
      <View style={styles.grid}>
        {/* ช่องว่างก่อนวันแรก */}
        {Array.from({ length: emptyDays }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0);

          // 🔥 ใช้ local date key
          const dateKey = getLocalDateKey(date);

          const isPastOrToday = date <= today;
          const isToday = date.getTime() === today.getTime();
          const mood = moods[dateKey];

          return (
            <View key={day} style={styles.dayCell}>
              <TouchableOpacity
                disabled={!isPastOrToday}
                onPress={() => isPastOrToday && onSelectDate(dateKey)}
                style={[
                  styles.circle,
                  isToday && styles.today,
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
    </>
  );
}

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    marginVertical: 8,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  today: {
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
});
