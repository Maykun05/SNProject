import { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthProvider';
import { useProfile } from '../context/ProfileContext';
import { getProfileAge } from '../utils/profileHealth';

const GREEN = '#1E4D2B';
const GRADIENT_END = '#1B5E45';
const MUTED = '#688A7A';
const HERO_ICON = 'rgba(255,255,255,0.88)';

/** แถบ 5 สี = ช่วง BMI ตามเกณฑ์ในหน้านี้ — map ค่า BMI ไปยัง % ความกว้างแถบให้ตัวชี้อยู่ในช่องสีที่ถูกต้อง */
const bmiToMarkerPercent = (bmi) => {
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  if (bmi < 18.5) {
    const lo = 15;
    const hi = 18.5;
    const t = bmi <= lo ? 0 : clamp01((bmi - lo) / (hi - lo));
    return t * 20;
  }
  if (bmi < 23) {
    const t = clamp01((bmi - 18.5) / (23 - 18.5));
    return 20 + t * 20;
  }
  if (bmi < 25) {
    const t = clamp01((bmi - 23) / (25 - 23));
    return 40 + t * 20;
  }
  if (bmi < 30) {
    const t = clamp01((bmi - 25) / (30 - 25));
    return 60 + t * 20;
  }
  const t = clamp01((bmi - 30) / (40 - 30));
  return 80 + t * 20;
};

const BMIScreen = () => {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);
  const { profile, loading: profileLoading, refreshProfile } = useProfile();

  if (!userToken) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerPad}>
          <Text style={styles.muted}>ยังไม่ได้เข้าสู่ระบบ</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerPad}>
          <ActivityIndicator size="large" color="#2E7D5B" />
          <Text style={styles.muted}>กำลังโหลดข้อมูล…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const gender = profile.gender;
  const birthRaw = profile.birthDate;

  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerPad}>
          <Ionicons name="person-outline" size={48} color={MUTED} />
          <Text style={styles.errorText}>
            กรุณากรอกส่วนสูงและน้ำหนักในโปรไฟล์เพื่อคำนวณ BMI
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refreshProfile?.()}>
            <Text style={styles.retryBtnText}>โหลดข้อมูลอีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const age = getProfileAge(birthRaw);

  const heightMeter = height / 100;
  const bmi = (weight / (heightMeter * heightMeter)).toFixed(2);
  const bmiValue = parseFloat(bmi);

  const getCategoryColor = () => {
    if (bmiValue < 18.5) return '#5DADE2';
    if (bmiValue < 23) return '#58D68D';
    if (bmiValue < 25) return '#F4D03F';
    if (bmiValue < 30) return '#EB984E';
    return '#E74C3C';
  };

  const getCategory = () => {
    if (bmiValue < 18.5) return 'ผอม';
    if (bmiValue < 23) return 'น้ำหนักเหมาะสม';
    if (bmiValue < 25) return 'น้ำหนักเกิน';
    if (bmiValue < 30) return 'อ้วนระดับ 1';
    return 'อ้วนระดับ 2';
  };

  const category = getCategory();
  const accent = getCategoryColor();

  const minWeight = (18.5 * heightMeter * heightMeter).toFixed(1);
  const maxWeightNum = 22.9 * heightMeter * heightMeter;
  const maxWeight = maxWeightNum.toFixed(1);
  const recommendedWeight = (
    (parseFloat(minWeight) + parseFloat(maxWeight)) /
    2
  ).toFixed(0);
  const weightToLose = (weight - maxWeightNum).toFixed(1);
  const shouldShowLoseWeight = parseFloat(weightToLose) > 0;

  const markerPercent = bmiToMarkerPercent(bmiValue);

  const generateAdvice = () => {
    const advice = [];

    if (bmiValue < 18.5) {
      advice.push('เพิ่มแคลอรี่ในแต่ละวัน');
      advice.push('เพิ่มโปรตีน เช่น ไข่ ปลา นม');
      advice.push('ออกกำลังกายแบบ Strength Training');
    } else if (bmiValue < 23) {
      advice.push('รักษาพฤติกรรมการกินที่ดี');
      advice.push('ออกกำลังกายสม่ำเสมอ');
    } else if (bmiValue < 25) {
      advice.push('ควบคุมปริมาณแคลอรี่');
      advice.push('ลดน้ำตาลและของหวาน');
    } else {
      advice.push('ควบคุมแคลอรี่');
      advice.push('เพิ่มคาร์ดิโอ เช่น เดินเร็ว วิ่ง ปั่นจักรยาน');
      advice.push('Strength Training 2-3 ครั้ง/สัปดาห์');
    }

    if (age != null && age > 40) {
      advice.push('เพิ่มคาร์ดิโอเพื่อสุขภาพหัวใจ');
    }

    const g = String(gender || '').toUpperCase();
    if (g === 'FEMALE') {
      advice.push('เพิ่มอาหารที่มีธาตุเหล็ก เช่น ผักใบเขียว');
    }

    if (g === 'MALE') {
      advice.push('เพิ่มโปรตีนเพื่อเสริมสร้างกล้ามเนื้อ');
    }

    advice.push('ดื่มน้ำวันละ 1.5 - 2 ลิตร');
    advice.push('นอนหลับอย่างน้อย 7-8 ชั่วโมง');

    return advice;
  };

  const adviceList = generateAdvice();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: 4,
          paddingBottom: insets.bottom + 56,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ดัชนีมวลกาย</Text>
          <Text style={styles.headerSub}>
            คำนวณจากส่วนสูงและน้ำหนักในโปรไฟล์ของคุณ
          </Text>
        </View>

        <LinearGradient
          colors={[GREEN, GRADIENT_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>BMI</Text>
          <Text style={[styles.heroBmi, { color: accent }]}>{bmi}</Text>
          <View style={[styles.categoryPill, { backgroundColor: accent }]}>
            <Text style={styles.categoryPillText}>{category}</Text>
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <MaterialCommunityIcons
                name="human-male-height"
                size={18}
                color={HERO_ICON}
              />
              <Text style={styles.heroStatValue}>{height} cm</Text>
              <Text style={styles.heroStatLabel}>ส่วนสูง</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={18}
                color={HERO_ICON}
              />
              <Text style={styles.heroStatValue}>{weight} kg</Text>
              <Text style={styles.heroStatLabel}>น้ำหนัก</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <MaterialCommunityIcons
                name="calendar-account"
                size={18}
                color={HERO_ICON}
              />
              <Text style={styles.heroStatValue}>
                {age != null ? `${age} ปี` : '—'}
              </Text>
              <Text style={styles.heroStatLabel}>อายุ</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionLabel}>ช่วง BMI (อ้างอิง)</Text>
        <View style={styles.scaleSection}>
          <View style={styles.markerRow}>
            <View
              style={[
                styles.markerHit,
                {
                  left: `${markerPercent}%`,
                  transform: [{ translateX: -MARKER_WIDTH / 2 }],
                },
              ]}
            >
              <View style={styles.markerTriangle} />
            </View>
          </View>
          <View style={styles.barContainer}>
            <View style={[styles.bar, { backgroundColor: '#5DADE2' }]} />
            <View style={[styles.bar, { backgroundColor: '#58D68D' }]} />
            <View style={[styles.bar, { backgroundColor: '#F4D03F' }]} />
            <View style={[styles.bar, { backgroundColor: '#EB984E' }]} />
            <View style={[styles.bar, { backgroundColor: '#E74C3C' }]} />
          </View>
          <View style={styles.scaleLegend}>
            <Text style={styles.scaleLegendText}>ผอม</Text>
            <Text style={styles.scaleLegendText}>ปกติ</Text>
            <Text style={styles.scaleLegendText}>เกิน</Text>
            <Text style={styles.scaleLegendText}>อ้วน 1</Text>
            <Text style={styles.scaleLegendText}>อ้วน 2</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statCardHeader}>
            <Ionicons name="analytics-outline" size={22} color={GREEN} style={styles.statCardIcon} />
            <Text style={styles.statCardTitle}>น้ำหนักที่เหมาะสม</Text>
          </View>
          <Text style={styles.statCardBody}>
            ช่วงแนะนำ {minWeight}–{maxWeight} kg
          </Text>
          {shouldShowLoseWeight ? (
            <Text style={styles.statCardHint}>
              ควรลดประมาณ {weightToLose} kg เพื่อเข้าช่วงปกติ
            </Text>
          ) : null}
        </View>

        <View style={styles.statCard}>
          <View style={styles.statCardHeader}>
            <Ionicons name="flag-outline" size={22} color={GREEN} style={styles.statCardIcon} />
            <Text style={styles.statCardTitle}>น้ำหนักเป้าหมาย</Text>
          </View>
          <Text style={styles.statCardBody}>แนะนำประมาณ {recommendedWeight} kg</Text>
          <Text style={styles.statCardHint}>ตั้งเป้า BMI กลางช่วงปกติ</Text>
        </View>

        <Text style={styles.sectionTitle}>คำแนะสำหรับคุณ</Text>
        <View style={styles.adviceCard}>
          {adviceList.map((item, index) => (
            <View
              key={index}
              style={[
                styles.adviceRow,
                index === adviceList.length - 1 && styles.adviceRowLast,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#2E7D5B"
                style={styles.adviceIcon}
              />
              <Text style={styles.adviceText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MARKER_WIDTH = 12;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  scroll: {
    flex: 1,
  },
  centerPad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  muted: {
    marginTop: 10,
    color: MUTED,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    color: '#C62828',
    textAlign: 'center',
    fontSize: 15,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  header: {
    marginTop: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: GREEN,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroBmi: {
    fontSize: 52,
    fontWeight: '800',
    marginTop: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryPillText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  heroStatValue: {
    marginTop: 6,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroStatLabel: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
    marginBottom: 8,
  },
  scaleSection: {
    marginBottom: 20,
  },
  markerRow: {
    height: 10,
    marginBottom: 4,
    marginHorizontal: 2,
    position: 'relative',
  },
  markerHit: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: MARKER_WIDTH / 2,
    borderRightWidth: MARKER_WIDTH / 2,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1a1a1a',
  },
  barContainer: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
  },
  scaleLegend: {
    flexDirection: 'row',
    marginTop: 6,
  },
  scaleLegendText: {
    flex: 1,
    fontSize: 10,
    color: MUTED,
    textAlign: 'center',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardIcon: {
    marginRight: 8,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  statCardBody: {
    fontSize: 16,
    color: '#1a2e24',
    lineHeight: 22,
  },
  statCardHint: {
    marginTop: 8,
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GREEN,
    marginTop: 8,
    marginBottom: 10,
  },
  adviceCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EFEA',
  },
  adviceRowLast: {
    borderBottomWidth: 0,
  },
  adviceIcon: {
    marginTop: 1,
    marginRight: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 15,
    color: '#24352c',
    lineHeight: 22,
  },
});

export default BMIScreen;
