import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLocalDateKey } from '../../utils/dateUtils';
import WaterCircle from './WaterCircle';

/* ===== utils ===== */
const getEmptyDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  return (firstDay + 6) % 7;
};

export default function WaterCalendarGrid({
  year,
  month,
  waterData,
  todayWater,
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

          const dateKey = getLocalDateKey(date);

          const isToday = date.getTime() === today.getTime();

          // 🔥 ดึงค่าน้ำ
          const value = isToday
            ? todayWater
            : waterData[dateKey] || 0;

          return (
            <View key={day} style={styles.dayCell}>
              
              {/* 🔥 เปลี่ยนจาก Touchable → View (กดไม่ได้) */}
              <View style={[
                styles.circle,
                isToday && styles.today,
              ]}>
                <WaterCircle value={value} />
              </View>

              <Text style={styles.dayText}>{day}</Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDEDED',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // 🔥 สำคัญ (ให้น้ำไม่ล้น)
    },
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
    plus: {
        fontSize: 20,
        color: '#666',
    },
    dayText: {
        marginTop: 4,
        fontSize: 12,
        color: '#555',
    },
    icon: { width: 24, height: 24, resizeMode: 'contain' },
});