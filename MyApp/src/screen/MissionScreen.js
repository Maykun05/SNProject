import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ALL_MISSIONS } from '../constants/missions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../context/ProfileContext';
import { useLevel, XP_REWARDS } from '../context/LevelContext';

const MissionScreen = () => {
  const{profile} = useProfile();
  // คอมโพเนนต์ย่อยสำหรับภารกิจแต่ละใบ
  const MissionCard = ({ title, subtitle, progress, total, timeLeft, color, iconName }) => (
    <TouchableOpacity style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={[styles.timeText, { color: color }]}>🕒 {timeLeft}</Text>
          </View>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(progress/total)*100}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressValue}>{progress} / {total}</Text>
        </View>
        <Text style={styles.arrow}>〉</Text>
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
                <View style={styles.dailyRewardRow}>
                <Text style={styles.dailyText}>{item.title} </Text>
                <Text style={styles.dailyRewardText}>+{item.reward}</Text>
                <Image
                  source={require('../assets/coin.png')}
                  style={styles.inlineCoinImage}
                />
              </View>
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
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerSmall}>ภารกิจ</Text>

          {/* ✅ แสดง profile.coins แทน coins state */}
          <View style={styles.coinWrapper}>
            <View style={styles.coinIcon}>
              <Image
                source={require('../assets/coin.png')} // ✅ แก้ path
                style={styles.coinImage}
              />
            </View>
            <Text style={styles.coinText}>{profile.coins ?? 0}</Text>
          </View>

        </View>

        {Boolean(monthlyMission) && (
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

            {/* ✅ เพิ่ม progress bar */}
            <View style={styles.monthlyProgressRow}>
              <View style={styles.monthlyProgressBg}>
                <View style={[styles.monthlyProgressFill, {
                  width: `${(0 / monthlyMission.goal) * 100}%`, // เปลี่ยน 0 เป็นค่า progress จริงเมื่อมีข้อมูล
                }]} />
              </View>
              <Text style={styles.monthlyProgressText}>
                0 / {monthlyMission.goal} {monthlyMission.unit}
              </Text>
            </View>
          </LinearGradient>
        )}

        <Text style={styles.sectionTitle}>ภารกิจทั้งหมด ✨</Text>

        {/* Mission List */}
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
                <Text style={styles.timeTextGreen}>🔥 3 วัน</Text>
            </View>
            <View style={styles.stepContainer}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} style={[styles.stepDot, i <= 3 ? styles.stepActive : null]} />
                ))}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  header: {
    flexDirection: 'row', justifyContent: 'center',
    padding: 25, alignItems: 'center', position: 'relative',
  },
  headerSmall: { fontSize: 32, fontWeight: '800', color: '#2E7D5B', opacity: 0.8,textAlign: 'center', flex: 1,},
  coinWrapper: {
    position: 'absolute', right: 25,
    alignItems: 'center', 
    flexDirection: 'row', 
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
  monthlyProgressRow: {
  marginTop: 12,
  marginLeft: 50,
},
monthlyProgressBg: {
  height: 8, backgroundColor: '#ffffff44',
  borderRadius: 4, overflow: 'hidden', marginBottom: 4,
},
monthlyProgressFill: {
  height: 8, backgroundColor: '#fff', borderRadius: 4,
},
monthlyProgressText: {
  color: '#ffffffcc', fontSize: 11,
},
  monthlyBadgeText: { color: '#fff', fontSize: 12 },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 25, marginBottom: 15, color: '#1B4332' },
  
  card: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 20, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  accentBar: { width: 6 },
  cardContent: { flex: 1, flexDirection: 'row', padding: 15, alignItems: 'center' },
  iconContainer: { marginRight: 15 },
  mockIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B4332' },
  cardSubtitle: { fontSize: 13, color: '#666', marginVertical: 4 },
  timeText: { fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, marginTop: 8 },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressValue: { fontSize: 12, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  arrow: { fontSize: 20, color: '#CCC', marginLeft: 10 },
  arrowWhite: { fontSize: 20, color: '#FFF' },

  dailyTaskContainer: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 20, elevation: 2 },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  timeTextGreen: { color: '#4CAF50', fontWeight: 'bold' },
  stepContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E0' },
  stepActive: { backgroundColor: '#4CAF50', transform: [{ scale: 1.25 }] },
  stepToday: { borderWidth: 2, borderColor: '#2E7D5B' },
  // Daily mission styles
  dailyRewardRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
dailyRewardText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#C8861A',
  marginRight: 3,
},
inlineCoinImage: {
  width: 16,
  height: 16,
  resizeMode: 'contain',
},
});

export default MissionScreen;