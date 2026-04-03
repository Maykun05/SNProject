import React, { useCallback, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalendarGrid from '../components/calender/CalendarGrid';
import MoodPickerModal from '../components/calender/MoodPickerModal';
import MoodCount from '../components/calender/MoodCount';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMoods, setMoodByDate, getLocalMoodsForMonth } from '../services/moodService';
import { AuthContext } from "../context/AuthProvider";
export default function CalendarScreen() {
  const { userToken, userId } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moods, setMoods] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useFocusEffect(
    useCallback(() => {
      loadMoods(month + 1, year);
    }, [month, year])
  );

  const loadMoods = async (m, y) => {
    try {
      const local = await getLocalMoodsForMonth(m, y, userId);
      const server = await getAllMoods(m, y, userToken, userId);

      // 🔥 รวมกัน
      setMoods({
        ...local,
        ...server,
      });

    } catch (err) {
      console.log(err);
    }
  };

  /* ===== บันทึก / แก้ mood ===== */
  const onSelectMood = async (mood) => {
    await setMoodByDate(selectedDate, mood, userToken, userId);
    await loadMoods(month + 1, year);

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
      {/* <MoodCount moods={monthlyMoods} /> */}
      <MoodCount moods={moods} />

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
    fontSize: 30,
    color: '#2D4F45',
    paddingHorizontal: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
