import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalendarGrid from '../components/CalendarGrid';
import MoodPickerModal from '../components/MoodPickerModal';
import MoodCount from '../components/MoodCount';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMoods, setMoodByDate } from '../services/moodService';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moods, setMoods] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /* ===== โหลด mood ทั้งหมดครั้งเดียว ===== */
  useFocusEffect(
    React.useCallback(() => {
      loadMoods();
    }, [])
  );

  const loadMoods = async () => {
    const data = await getAllMoods();
    setMoods(data);
  };

  /* ===== บันทึก / แก้ mood ===== */
  const onSelectMood = async (mood) => {
    const updated = await setMoodByDate(selectedDate, mood);
    setMoods(updated);
    setSelectedDate(null);
  };

  /* ===== เลื่อนเดือน ===== */
  const goPrevMonth = () => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    if (next <= new Date()) {
      setCurrentDate(next);
    }
  };

  /* =====  filter moods เฉพาะเดือนที่กำลังดู ===== */
  const monthlyMoods = useMemo(() => {
    return Object.fromEntries(
      Object.entries(moods).filter(([dateKey]) => {
        const date = new Date(dateKey);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month
        );
      })
    );
  }, [moods, year, month]);

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrevMonth}>
          <Text style={styles.arrow}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {currentDate.toLocaleString('th-TH', { month: 'long' })} {year + 543}
        </Text>

        <TouchableOpacity onPress={goNextMonth}>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* ===== Calendar ===== */}
      <CalendarGrid
        year={year}
        month={month}
        moods={moods}
        onSelectDate={setSelectedDate}
      />

      {/* ===== Mood Count (รายเดือน) ===== */}
      <MoodCount moods={monthlyMoods} />

      {/* ===== Mood Picker ===== */}
      <MoodPickerModal
        visible={!!selectedDate}
        onSelect={onSelectMood}
        onClose={() => setSelectedDate(null)}
      />
    </SafeAreaView>
  );
}

/* ======================
   STYLES
====================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
  },
});
