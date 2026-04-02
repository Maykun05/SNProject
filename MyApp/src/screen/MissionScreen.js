import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, SafeAreaView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ALL_MISSIONS } from '../constants/missions';
import ProfileAvatar from '../components/ProfileAvatar.js'; // ✅ แก้ path
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../context/ProfileContext';
import { useLevel, XP_REWARDS } from '../context/LevelContext';

const MissionScreen = () => {
  const { profile, addCoins } = useProfile(); // ✅ ดึง addCoins + profile.coins
  const { addXp } = useLevel();

  const [streak, setStreak]           = useState(0);
  const [activeDays, setActiveDays]   = useState([]);
  const [dailyMissions, setDailyMissions] = useState([]);
  const [weeklyMission, setWeeklyMission] = useState(null);
  const [monthlyMission, setMonthlyMission] = useState(null);

  // ✅ ลบ coins state และ coinsLoaded ออกทั้งหมด
  // ✅ ใช้ profile.coins แทน

  const toggleMission = (id) => {
    setDailyMissions(prev => {
      const updated = prev.map(m => {
        if (m.id === id) {
          const newCompleted = !m.completed;
          if (newCompleted && !m.rewarded) {
            // ✅ เพิ่มเหรียญผ่าน ProfileContext แทน setCoins
            addCoins(m.reward);
            addXp(XP_REWARDS.dailyMission, (newLevel) => {
              Alert.alert('🎉 เลเวลอัพ!', `คุณขึ้นเป็น เลเวล ${newLevel} แล้ว!`);
            });
            return { ...m, completed: true, rewarded: true };
          }
          return { ...m, completed: newCompleted };
        }
        return m;
      });

      const allDone = updated.every(m => m.completed);
      if (allDone) {
        addXp(XP_REWARDS.allDailyMission, (newLevel) => {
          Alert.alert('🎉 เลเวลอัพ!', `คุณขึ้นเป็น เลเวล ${newLevel} แล้ว!`);
        });
      }

      // ✅ บันทึก missions state ลง AsyncStorage
      AsyncStorage.setItem('DAILY_MISSIONS', JSON.stringify({
        date: getLocalDateString(),
        missions: updated,
      }));

      return updated;
    });
  };

  const getLocalDateString = (date = new Date()) => {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const updateStreak = async () => {
    const today = getLocalDateString();
    try {
      const data = await AsyncStorage.getItem('STREAK_DATA');
      let parsed = data
        ? JSON.parse(data)
        : { lastActiveDate: null, streakCount: 0, history: [] };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = getLocalDateString(yesterday);

      if (parsed.lastActiveDate === today) {
        setStreak(parsed.streakCount || 0);
        setActiveDays(parsed.history || []);
        return;
      }

      parsed.streakCount = parsed.lastActiveDate === yDate
        ? (parsed.streakCount || 0) + 1 : 1;

      if (parsed.lastActiveDate !== yDate) parsed.history = [];

      parsed.lastActiveDate = today;
      parsed.history.push(today);
      if (parsed.history.length > 6) parsed.history.shift();

      await AsyncStorage.setItem('STREAK_DATA', JSON.stringify(parsed));
      setStreak(parsed.streakCount);
      setActiveDays(parsed.history);
    } catch (e) {
      console.error('streak error:', e);
    }
  };

  useEffect(() => {
    updateStreak();
  }, []);

  useEffect(() => {
    const loadDaily = async () => {
      const today = getLocalDateString();
      const saved = await AsyncStorage.getItem('DAILY_MISSIONS');
      const getRandom = (arr, n) =>
        [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setDailyMissions(parsed.missions);
          return;
        }
      }

      const newMissions = getRandom(ALL_MISSIONS.daily, 3).map(m => ({
        ...m, completed: false, rewarded: false,
      }));
      setDailyMissions(newMissions);
      await AsyncStorage.setItem('DAILY_MISSIONS', JSON.stringify({
        date: today, missions: newMissions,
      }));
    };
    loadDaily();

    const getRandom = (arr, n) =>
      [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
    setWeeklyMission(getRandom(ALL_MISSIONS.weekly, 1)[0]);
    setMonthlyMission(getRandom(ALL_MISSIONS.monthly, 1)[0]);
  }, []);

  const MissionCard = ({ title, subtitle, progress, total, timeLeft, color }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <View style={[styles.mockIcon, { backgroundColor: `${color}22` }]}>
            <Text style={{ fontSize: 24 }}>📅</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[styles.timeText, { color }]}>{timeLeft}</Text>
          </View>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: `${(progress / total) * 100}%`,
              backgroundColor: color,
            }]} />
          </View>
          <Text style={styles.progressValue}>{String(progress)} / {String(total)}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const DailyMissionGroupCard = ({ missions }) => {
    const completedCount = missions.filter(m => m.completed).length;
    const totalCount = missions.length;
    return (
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: '#4CAF50' }]} />
        <Text style={styles.dailyCount}>{completedCount}/{totalCount}</Text>
        <View style={styles.cardContent}>
          <View style={styles.infoContainer}>
            <Text style={styles.cardTitle}>ภารกิจประจำวัน</Text>
            {missions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dailyItem}
                onPress={() => toggleMission(item.id)}
              >
                <Text style={styles.dailyText}>
                  {item.title} (+{item.reward} 🪙)
                </Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, {
                    width: item.completed ? '100%' : '0%',
                    backgroundColor: '#4CAF50',
                  }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const currentMonthName = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(new Date());

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerSmall}>ภารกิจ</Text>

          {/* ✅ แสดง profile.coins แทน coins state */}
          <View style={styles.coinWrapper}>
            <View style={styles.coinIcon}>
              <Image
                source={require('/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/assets/coin.png')} // ✅ แก้ path
                style={styles.coinImage}
              />
            </View>
            <Text style={styles.coinText}>{profile.coins ?? 0}</Text>
          </View>

          <ProfileAvatar />
        </View>

        {monthlyMission && (
          <LinearGradient
            colors={['#4CAF50', '#2E7D5B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.monthlyCard}
          >
            <View style={styles.monthlyInfo}>
              <View style={styles.calendarIconBg}>
                <Text style={{ fontSize: 20 }}>📅</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ color: '#ffffffaa', fontSize: 12, fontWeight: 'bold' }}>
                  ภารกิจประจำเดือน {currentMonthName}
                </Text>
                <Text style={styles.monthlyTitle} numberOfLines={1}>
                  {monthlyMission.title}
                </Text>
              </View>
              <Text style={styles.arrowWhite}>›</Text>
            </View>
            <View style={styles.monthlyBadge}>
              <Text style={styles.monthlyBadgeText}>
                เป้าหมาย: {monthlyMission.goal} {monthlyMission.unit}
              </Text>
            </View>
          </LinearGradient>
        )}

        <Text style={styles.sectionTitle}>ภารกิจทั้งหมด ✨</Text>

        {weeklyMission && (
          <MissionCard
            title="ภารกิจรายสัปดาห์"
            subtitle={weeklyMission.title}
            progress={0}
            total={weeklyMission.goal}
            timeLeft="เหลืออีก 6 วัน"
            color="#FF9800"
          />
        )}

        <DailyMissionGroupCard missions={dailyMissions} />

        <View style={styles.dailyTaskContainer}>
          <View style={styles.dailyHeader}>
            <Text style={styles.cardTitle}>ความต่อเนื่อง</Text>
            <Text style={styles.timeTextGreen}>🔥 {streak} วัน</Text>
          </View>
          <View style={styles.stepContainer}>
            {Array.from({ length: 7 }, (_, i) => {
              const isActive = i < streak;
              const isToday  = i === Math.min(streak - 1, 6);
              return (
                <View key={i} style={[
                  styles.stepDot,
                  isActive && styles.stepActive,
                  isToday  && styles.stepToday,
                ]} />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// styles เหมือนเดิมทุกอย่าง ไม่ต้องเปลี่ยน
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 25, alignItems: 'center', position: 'relative',
  },
  headerSmall: { fontSize: 32, fontWeight: '800', color: '#2E7D5B', opacity: 0.8 },
  coinWrapper: {
    position: 'absolute', left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', zIndex: 1,
  },
  coinIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFC83D', borderWidth: 2,
    borderColor: '#1E1E1E', justifyContent: 'center',
    alignItems: 'center', marginRight: 6,
  },
  coinText: {
    fontSize: 22, color: '#000', fontWeight: '600',
    lineHeight: 20, includeFontPadding: false, textAlignVertical: 'center',
  },
  coinImage: { width: 20, height: 20, resizeMode: 'contain' },
  dailyItem: { marginTop: 10 },
  dailyText: {
    fontSize: 16, fontWeight: '500', color: '#000',
    marginBottom: 4, includeFontPadding: false,
    textAlignVertical: 'center', lineHeight: 22,
  },
  dailyCount: {
    position: 'absolute', top: 10, right: 15,
    fontSize: 12, fontWeight: 'bold', color: '#4CAF50',
  },
  monthlyCard: { margin: 20, borderRadius: 25, padding: 20, elevation: 5 },
  monthlyInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarIconBg: { backgroundColor: '#fff', padding: 8, borderRadius: 12 },
  monthlyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, marginLeft: 15 },
  monthlyBadge: {
    backgroundColor: '#ffffff44', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 15, marginTop: 10, marginLeft: 50,
  },
  monthlyBadgeText: { color: '#fff', fontSize: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 25, marginBottom: 15, color: '#1B4332' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15,
    borderRadius: 20, flexDirection: 'row', overflow: 'hidden',
    elevation: 2, position: 'relative',
  },
  accentBar: { width: 6 },
  cardContent: { flex: 1, flexDirection: 'row', padding: 15, alignItems: 'center' },
  iconContainer: { marginRight: 15 },
  mockIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B4332' },
  cardSubtitle: { fontSize: 13, color: '#666', marginVertical: 4 },
  timeText: { fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressValue: { fontSize: 12, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  arrow: { fontSize: 20, color: '#CCC', marginLeft: 10, marginRight: 5 },
  arrowWhite: { fontSize: 20, color: '#FFF' },
  dailyTaskContainer: {
    backgroundColor: '#fff', marginHorizontal: 20,
    padding: 20, borderRadius: 20, elevation: 2, marginBottom: 20,
  },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  timeTextGreen: { color: '#4CAF50', fontWeight: 'bold' },
  stepContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E0' },
  stepActive: { backgroundColor: '#4CAF50', transform: [{ scale: 1.25 }] },
  stepToday: { borderWidth: 2, borderColor: '#2E7D5B' },
});

export default MissionScreen;