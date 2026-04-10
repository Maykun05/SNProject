import React, { useCallback, useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaterCalendarGrid from '../components/calender/WaterCalenderGrid'
import CalendarGrid from '../components/calender/CalendarGrid';
import MoodPickerModal from '../components/calender/MoodPickerModal';
import MoodCount from '../components/calender/MoodCount';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMoods, setMoodByDate, getLocalMoodsForMonth } from '../services/moodService';
import { fetchWaterMonth } from '../services/waterApi';
import { getLocalDateKey } from '../utils/dateUtils';
import { AuthContext } from "../context/AuthProvider";
import { useWater } from "../context/WaterContext";

export default function CalendarScreen() {
  const [mode, setMode] = useState('mood'); // 'mood' | 'water'
  const [waterData, setWaterData] = useState({});
  const { userToken, userId } = useContext(AuthContext);
  const { waterGoal, consumed } = useWater();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moods, setMoods] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadMoods = useCallback(async (m, y) => {
    try {
      const local = await getLocalMoodsForMonth(m, y, userId);
      const server = await getAllMoods(m, y, userToken, userId);
      setMoods({ ...local, ...server });
    } catch (err) {
      console.log(err);
    }
  }, [userId, userToken]);

  /** โหมดไม่ล็อกอิน: แสดงเฉพาะวันนี้ในเดือนที่กำลังดู (ตรงกับ WaterContext local) */
  const applyGuestWaterToCalendar = useCallback(() => {
    const now = new Date();
    const viewingCurrentMonth =
      now.getFullYear() === year && now.getMonth() === month;
    if (viewingCurrentMonth) {
      setWaterData({ [getLocalDateKey()]: consumed });
    } else {
      setWaterData({});
    }
  }, [year, month, consumed]);

  /** โหลดยอดรวมรายวันในเดือนจาก DB — ชุดเดียวกับที่หน้าน้ำใช้บันทึก */
  const refreshWaterMonthFromApi = useCallback(async () => {
    const calMonth = month + 1;
    try {
      const data = await fetchWaterMonth(userToken, year, calMonth);
      setWaterData(data && typeof data === 'object' ? data : {});
    } catch (err) {
      console.warn('refreshWaterMonthFromApi', err);
      setWaterData({});
    }
  }, [userToken, year, month]);

  useFocusEffect(
    useCallback(() => {
      loadMoods(month + 1, year);
      if (mode !== 'water') return;
      if (userToken) refreshWaterMonthFromApi();
      else applyGuestWaterToCalendar();
    }, [month, year, mode, loadMoods, userToken, refreshWaterMonthFromApi, applyGuestWaterToCalendar])
  );

  useEffect(() => {
    if (mode !== 'water') return;
    if (!userToken) applyGuestWaterToCalendar();
  }, [mode, applyGuestWaterToCalendar, userToken]);

  useEffect(() => {
    if (mode !== 'water' || !userToken) return;
    refreshWaterMonthFromApi();
  }, [mode, month, year, userToken, refreshWaterMonthFromApi]);

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

      {/* ===== TOP HEADER ===== */}
      <View style={styles.topHeader}>
        <Text style={styles.mainTitle}>ปฏิทิน</Text>

        {/* <View style={styles.modeSwitch}>
          <TouchableOpacity onPress={() => setMode('water')}>
            <Text style={[styles.modeText, mode === 'water' && styles.active]}>
              น้ำ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode('mood')}>
            <Text style={[styles.modeText, mode === 'mood' && styles.active]}>
              อารมณ์
            </Text>
          </TouchableOpacity>
        </View> */}
        <View style={styles.segment}>
          {/* WATER */}
          <TouchableOpacity
            style={[
              styles.segmentItem,
              mode === 'water' && styles.activeLeft,
            ]}
            onPress={() => setMode('water')}
          >
            <Text
              style={[
                styles.segmentText,
                mode === 'water' && styles.activeText,
              ]}
            >
              น้ำ
            </Text>
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* MOOD */}
          <TouchableOpacity
            style={[
              styles.segmentItem,
              mode === 'mood' && styles.activeRight,
            ]}
            onPress={() => setMode('mood')}
          >
            <Text
              style={[
                styles.segmentText,
                mode === 'mood' && styles.activeText,
              ]}
            >
              อารมณ์
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== CARD (กรอบใหญ่) ===== */}
      <View style={styles.calendarCard}>

        {/* ===== HEADER เดือน ===== */}
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

        {/* ===== CALENDAR SWITCH ===== */}
        {mode === 'mood' ? (
          <CalendarGrid
            year={year}
            month={month}
            moods={moods}
            onSelectDate={setSelectedDate}
          />
        ) : (
          <WaterCalendarGrid
            year={year}
            month={month}
            waterData={waterData}
            waterGoal={waterGoal}
          />
        )}

      </View>

      {Boolean(mode === 'mood') && <MoodCount moods={moods} />}

      {Boolean(mode === 'mood') && (
      <MoodPickerModal
        visible={!!selectedDate}
        onSelect={onSelectMood}
        onClose={() => setSelectedDate(null)}
      />
    )}
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

  topHeader: {
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  modeSwitch: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },

  modeText: {
    fontSize: 14,
    color: '#888',
  },

  active: {
    color: '#000',
    fontWeight: 'bold',
  },

  calendarCard: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    right: 20,
  },

  segmentItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  segmentText: {
    fontSize: 13,
    color: '#666',
  },

  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  divider: {
    width: 1,
    backgroundColor: '#ccc',
  },

  activeLeft: {
    backgroundColor: '#2D4F45',
  },

  activeRight: {
    backgroundColor: '#2D4F45',
  },
});
