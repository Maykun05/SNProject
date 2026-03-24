import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_MISSIONS } from '/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/constants/missions.js';

const MissionScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [streak, setStreak] = useState(0);
  const [activeDays, setActiveDays] = useState([]);

  const [dailyMissions, setDailyMissions] = useState([]);
  const [weeklyMission, setWeeklyMission] = useState(null);
  const [monthlyMission, setMonthlyMission] = useState(null);

  useEffect(() => {
    updateStreak();
    
    // ฟังก์ชันสำหรับสุ่ม Array
    const getRandom = (arr, n) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    // สุ่มและตั้งค่า State (สุ่มครั้งเดียวตอนเข้าหน้าจอ)
    setDailyMissions(getRandom(ALL_MISSIONS.daily, 3));
    setWeeklyMission(getRandom(ALL_MISSIONS.weekly, 1)[0]);
    setMonthlyMission(getRandom(ALL_MISSIONS.monthly, 1)[0]);
  }, []);

  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission required', 'ต้องอนุญาตให้เข้าถึงรูปภาพ');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('pickImage error:', error);
      Alert.alert('Error', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  const updateStreak = async () => {
    const today = getLocalDateString();

    try {
      const data = await AsyncStorage.getItem('STREAK_DATA');

      let parsed = data
        ? JSON.parse(data)
        : {
            lastActiveDate: null,
            streakCount: 0,
            history: [],
          };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = getLocalDateString(yesterday);

      // เคยเข้าแล้ววันนี้ → ไม่ต้อง update
      if (parsed.lastActiveDate === today) {
        setStreak(parsed.streakCount || 0);
        setActiveDays(parsed.history || []);
        return;
      }

      // ต่อ streak
      if (parsed.lastActiveDate === yDate) {
        parsed.streakCount = (parsed.streakCount || 0) + 1;
      } else {
        parsed.streakCount = 1;
        parsed.history = [];
      }

      parsed.lastActiveDate = today;
      parsed.history.push(today);

      // จำกัดเก็บแค่ 6 วันล่าสุด
      if (parsed.history.length > 6) {
        parsed.history.shift();
      }

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
            <View
              style={[
                styles.progressBarFill,
                { width: `${(progress / total) * 100}%`, backgroundColor: color },
              ]}
            />
          </View>

          <Text style={styles.progressValue}>
            {progress} / {total}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const today = getLocalDateString();

  // ดึงชื่อเดือนภาษาไทย (เช่น "เมษายน", "พฤษภาคม")
const currentMonthName = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(new Date());

// ดึงปี พ.ศ. (ถ้าต้องการ)
const currentYearThai = new Date().getFullYear() + 543;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSmall}>ภารกิจ</Text>
          </View>

          <TouchableOpacity onPress={pickImage} style={styles.profileWrapper} activeOpacity={0.8}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : { uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' }
              }
              style={styles.profileImage}
            />
            <View style={styles.editIcon}>
              <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ส่วนของ Monthly Mission */}
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
                {/* แสดงชื่อเดือนปัจจุบันอัตโนมัติ */}
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

        <Text style={styles.sectionTitle}>ภารกิจแนะนำ ✨</Text>

        {/* 2. ส่วนของ Weekly Mission (แสดง 1 อันที่สุ่มมา) */}
        {weeklyMission && (
          <MissionCard
            title="ภารกิจรายสัปดาห์"
            subtitle={weeklyMission.title}
            progress={0} // ตรงนี้ควรดึงมาจาก Database ของ User จริง
            total={weeklyMission.goal}
            timeLeft="เหลืออีก 6 วัน"
            color="#FF9800"
          />
        )}

        {/* 3. ส่วนของ Daily Missions (แสดง 3 อันที่สุ่มมา) */}
        {dailyMissions.map((item) => (
          <MissionCard
            key={item.id}
            title="ภารกิจประจำวัน"
            subtitle={item.title}
            progress={0} // ตรงนี้ควรดึงมาจาก Database ของ User จริง
            total={item.goal}
            timeLeft="23 ชม. 59 นาที"
            color="#4CAF50"
          />
        ))}

        <Text style={styles.sectionTitle}>ภารกิจทั้งหมด ✨</Text>

        <MissionCard
          title="ภารกิจประจำสัปดาห์"
          subtitle="สะสมครบ 20 แต้มภารกิจ"
          progress={12}
          total={20}
          timeLeft="เหลืออีก 3 วัน"
          color="#FF9800"
        />

        <MissionCard
          title="ภารกิจประจำวัน"
          subtitle="เรียนให้ครบ 3 ชม.เพื่อแกะสลักรูปปั้น"
          progress={0}
          total={3}
          timeLeft="เหลือเวลา 13 ชั่วโมง"
          color="#4CAF50"
        />

        <View style={styles.dailyTaskContainer}>
          <View style={styles.dailyHeader}>
            <Text style={styles.cardTitle}>ความต่อเนื่อง</Text>
            <Text style={styles.timeTextGreen}>🔥 {streak} วัน</Text>
          </View>

          <View style={styles.stepContainer}>
            {Array.from({ length: 7 }, (_, i) => {
              const isActive = i < streak;
              const isToday = i === Math.min(streak - 1, 6);

              return (
                <View
                  key={i}
                  style={[
                    styles.stepDot,
                    isActive && styles.stepActive,
                    isToday && styles.stepToday
                  ]}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 25,
    alignItems: 'center',
  },

  headerSmall: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E7D5B',
    opacity: 0.8,
  },

  profileWrapper: {
    position: 'relative',
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },

  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 4,
  },

  monthlyCard: {
    margin: 20,
    borderRadius: 25,
    padding: 20,
    elevation: 5,
  },

  monthlyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  calendarIconBg: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
  },

  monthlyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 15,
  },

  monthlyBadge: {
    backgroundColor: '#ffffff44',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 10,
    marginLeft: 50,
  },

  monthlyBadgeText: { color: '#fff', fontSize: 12 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 25,
    marginBottom: 15,
    color: '#1B4332',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
  },

  accentBar: { width: 6 },

  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },

  iconContainer: { marginRight: 15 },

  mockIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContainer: { flex: 1 },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4332',
  },

  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
  },

  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  progressBarBg: {
    height: 8,
    backgroundColor: '#EEE',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },

  progressValue: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  arrow: {
    fontSize: 20,
    color: '#CCC',
    marginLeft: 10,
    marginRight: 5,
  },

  arrowWhite: { fontSize: 20, color: '#FFF' },

  dailyTaskContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 20,
  },

  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  timeTextGreen: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0E0E0',
  },

  stepActive: {
    backgroundColor: '#4CAF50',
    transform: [{ scale: 1.25 }],
  },

  stepToday: {
    borderWidth: 2,
    borderColor: '#2E7D5B',
  },
});

export default MissionScreen;