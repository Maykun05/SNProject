import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ALL_MISSIONS } from '../constants/missions';
import { useProfile } from '../context/ProfileContext';
import { useLevel, XP_REWARDS } from '../context/LevelContext';
import CoinBadge from '../components/CoinBadge';

const MissionScreen = () => {
  const { profile } = useProfile();
  const { level, levelInfo, xpPercent } = useLevel();

  const missionIconMap = {
    water: 'cup-water',
    food: 'food-apple',
    step: 'walk',
    mood: 'emoticon-happy-outline',
    sleep: 'sleep',
    default: 'trophy-outline',
  };

  const inferMissionType = (title = '') => {
    if (title.includes('น้ำ')) return 'water';
    if (title.includes('อาหาร') || title.includes('Calorie')) return 'food';
    if (title.includes('ก้าว') || title.includes('เดิน')) return 'step';
    if (title.includes('อารมณ์') || title.includes('สุข')) return 'mood';
    if (title.includes('นอน') || title.includes('หลับ')) return 'sleep';
    return 'default';
  };

  const getCurrentForMission = (mission, index) => {
    const t = inferMissionType(mission.title);
    const safeGoal = Math.max(1, Number(mission.goal) || 1);
    if (t === 'step') {
      const baseStep = profile?.goals?.dailyStep ?? 5000;
      return Math.min(safeGoal, Math.floor(baseStep * 0.65));
    }
    if (t === 'water') return Math.min(safeGoal, 1);
    if (t === 'food') return Math.min(safeGoal, 2);
    if (t === 'mood') return 0;
    if (t === 'sleep') return Math.min(safeGoal, 3);
    return Math.min(safeGoal, Math.floor(safeGoal * (0.2 + index * 0.15)));
  };

  const missionSections = useMemo(() => {
    const decorate = (missions = [], fallbackXp = 20) =>
      missions.map((mission, index) => {
        const current = getCurrentForMission(mission, index);
        const goal = Math.max(1, Number(mission.goal) || 1);
        const completed = current >= goal;
        const missionType = inferMissionType(mission.title);
        return {
          ...mission,
          current,
          goal,
          completed,
          progressPercent: Math.min(100, Math.round((current / goal) * 100)),
          iconName: missionIconMap[missionType] ?? missionIconMap.default,
          xpReward: fallbackXp + mission.reward,
        };
      });

    return {
      daily: decorate(ALL_MISSIONS.daily.slice(0, 3), XP_REWARDS.dailyMission),
      weekly: decorate(ALL_MISSIONS.weekly.slice(0, 2), XP_REWARDS.weeklyMission),
      monthly: decorate(ALL_MISSIONS.monthly.slice(0, 2), XP_REWARDS.monthlyMission),
    };
  }, [profile?.goals?.dailyStep]);

  const totalMissions = missionSections.daily.length + missionSections.weekly.length + missionSections.monthly.length;
  const completedMissions =
    [...missionSections.daily, ...missionSections.weekly, ...missionSections.monthly].filter((m) => m.completed).length;
  const totalProgressPercent = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  const currentMonthName = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(new Date());

  const MissionCard = ({ mission, color, periodLabel }) => (
    <TouchableOpacity activeOpacity={0.88} style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={mission.iconName} size={20} color={color} />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{mission.title}</Text>
            <Text style={[styles.periodTag, { color }]}>{periodLabel}</Text>
          </View>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardText}>+{mission.reward}</Text>
            <Image source={require('../assets/coin.png')} style={styles.inlineCoinImage} />
            <Text style={styles.rewardXpText}>+{mission.xpReward} XP</Text>
            {mission.completed && <Text style={styles.completedBadge}>Completed</Text>}
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${mission.progressPercent}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressValue}>
            {mission.current} / {mission.goal} {mission.unit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSmall}>Mission</Text>
            <Text style={styles.headerSubText}>ทำภารกิจสะสมเหรียญ เพื่อปลดล็อกต้นไม้และพัฒนาสุขภาพ</Text>
          </View>
          <View style={styles.headerCoinWrap}>
            <CoinBadge amount={profile.coins ?? 0} inline />
          </View>
        </View>

        <LinearGradient
          colors={['#2E7D5B', '#1B5E45']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroCaption}>Mission Objective</Text>
              <Text style={styles.heroTitle}>สร้างนิสัยสุขภาพที่ดีทุกวัน</Text>
              <Text style={styles.heroSubtitle}>
                ทำภารกิจเล็กๆ ให้ต่อเนื่อง แล้วเปลี่ยนเป็นผลลัพธ์ระยะยาวของร่างกายและใจ
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{level}</Text>
              <Text style={styles.levelName} numberOfLines={1}>{levelInfo.name}</Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>ความคืบหน้ารวม</Text>
              <Text style={styles.heroStatValue}>{totalProgressPercent}%</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>สำเร็จแล้ว</Text>
              <Text style={styles.heroStatValue}>{completedMissions}/{totalMissions}</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>XP ไปเลเวลถัดไป</Text>
              <Text style={styles.heroStatValue}>{xpPercent}%</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Today</Text>
        {missionSections.daily.map((mission) => (
          <MissionCard key={mission.id} mission={mission} color="#4CAF50" periodLabel="Daily" />
        ))}

        <Text style={styles.sectionTitle}>This Week</Text>
        {missionSections.weekly.map((mission) => (
          <MissionCard key={mission.id} mission={mission} color="#FF9800" periodLabel="Weekly" />
        ))}

        <Text style={styles.sectionTitle}>This Month ({currentMonthName})</Text>
        {missionSections.monthly.map((mission) => (
          <MissionCard key={mission.id} mission={mission} color="#4F6BED" periodLabel="Monthly" />
        ))}

        <View style={styles.streakCard}>
          <View style={styles.dailyHeader}>
            <Text style={styles.cardTitle}>ความต่อเนื่อง</Text>
            <Text style={styles.timeTextGreen}>🔥 3 วัน</Text>
          </View>
          <View style={styles.stepContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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
    justifyContent: 'center',
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 10,
    position: 'relative',
    minHeight: 84,
  },
  headerTitleWrap: { alignItems: 'center' },
  headerCoinWrap: {
    position: 'absolute',
    right: 20,
    top: 24,
  },
  headerSmall: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2E7D5B',
    opacity: 0.9,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerSubText: {
    marginTop: 2,
    fontSize: 12,
    color: '#5C7A6E',
    fontWeight: '500',
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 22,
    borderRadius: 24,
    padding: 18,
    elevation: 4,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTitleWrap: { flex: 1, paddingRight: 12 },
  heroCaption: { color: '#D2F7E4', fontSize: 12, fontWeight: '700' },
  heroTitle: { color: '#FFF', fontSize: 21, fontWeight: '800', marginTop: 2 },
  heroSubtitle: { color: '#E8F9F0', fontSize: 13, lineHeight: 19, marginTop: 6 },
  levelBadge: {
    width: 96,
    backgroundColor: '#FFFFFF20',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  levelText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  levelName: { color: '#D9F6EA', fontSize: 11, marginTop: 2 },
  heroStatsRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroStatItem: {
    flex: 1,
    backgroundColor: '#FFFFFF1C',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  heroStatLabel: { color: '#D8F5EA', fontSize: 11 },
  heroStatValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 24,
    marginBottom: 12,
    color: '#1B4332',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
  },
  accentBar: { width: 6 },
  cardContent: { flex: 1, flexDirection: 'row', padding: 14, alignItems: 'center' },
  iconContainer: {
    marginRight: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1B4332', flex: 1, paddingRight: 8 },
  periodTag: { fontSize: 11, fontWeight: '700' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 4 },
  rewardText: { fontSize: 13, fontWeight: '700', color: '#C8861A', marginRight: 3 },
  rewardXpText: { fontSize: 12, color: '#487D67', marginLeft: 8, fontWeight: '600' },
  completedBadge: {
    marginLeft: 8,
    backgroundColor: '#E6F7ED',
    color: '#188E4A',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, marginTop: 8 },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressValue: { fontSize: 11, color: '#688A7A', marginTop: 4, alignSelf: 'flex-end' },
  streakCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 28,
    padding: 18,
    borderRadius: 18,
    elevation: 2,
  },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  timeTextGreen: { color: '#4CAF50', fontWeight: 'bold' },
  stepContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  stepDot: { flex: 1, height: 10, borderRadius: 999, backgroundColor: '#E0E0E0' },
  stepActive: { backgroundColor: '#4CAF50', transform: [{ scale: 1.25 }] },
  inlineCoinImage: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
});

export default MissionScreen;