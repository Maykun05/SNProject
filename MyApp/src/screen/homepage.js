import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeHeader from '../components/home/HomeHeader';
import HomeCircle from '../components/home/HomeCircle';
import HomeFeatureRow from '../components/home/HomeFeatureRow';
import MoodQuickPicker from '../components/home/MoodQuickPicker';
import SleepQuickPicker from '../components/home/SleepQuickPicker';
import FeatureSelectorModal from '../components/home/FeatureSelectorModal';
import TreeSelectorModal from '../components/home/TreeSelectorModal'; // ✅ ใหม่
import { FEATURES } from '../constants/features';
import { TREE_ASSETS } from '../constants/treeAssets'; // ✅ ใหม่
import useHomeState from '../hooks/useHomeState';
import ProfileAvatar from '../components/home/ProfileAvatar.js';
import { useWater } from '../context/WaterContext';
import { useStep } from '../context/StepContext';

import GardenCard from '../components/home/GardenCard';
import { API_URL } from '../config';

/** โทนเดียวกับ ProfileScreen / ProfileScreen.README.md (สไลด์ 6) */
const GREEN = '#1E4D2B';
const PAGE_BG = '#F8F9FA';
const HERO_MINT = '#EEF5F0';
const CARD_BORDER = 'rgba(30, 77, 43, 0.12)';
const TEXT_MUTED = '#5A6F62';
const WATER = {
  main: GREEN,
  soft: HERO_MINT,
  border: CARD_BORDER,
  bar: '#3D7A52',
  iconBg: 'rgba(30, 77, 43, 0.14)',
};
const STEPS = {
  main: '#14321E',
  soft: '#FFFFFF',
  border: CARD_BORDER,
  bar: GREEN,
  iconBg: 'rgba(30, 77, 43, 0.1)',
};

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    doneMap,
    enabledFeatures,
    showMoodPicker,
    showSleepPicker,
    setShowSleepPicker,
    setShowMoodPicker,
    showFeatureModal,
    setShowFeatureModal,
    onPressFeature,
    setMoodToday,
    setSleepToday,
    toggleFeature,
    lastSleepHours,
    saveFeatures,
    mood,
  } = useHomeState();

  // ✅ State สำหรับเลือกแบบต้นไม้
  const [selectedTreeType, setSelectedTreeType] = useState(1);
  const [showTreeModal, setShowTreeModal] = useState(false);


  // โหลดแบบต้นไม้จาก DB (มี token) — ไม่มี token หรือ error ใช้ AsyncStorage สำรอง
  useEffect(() => {
    const fetchTreeType = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await fetch(`${API_URL}/api/tree-type`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json.success && json.selectedTreeType != null) {
            const t = Number(json.selectedTreeType);
            setSelectedTreeType(t);
            await AsyncStorage.setItem('selectedTreeType', String(t));
            return;
          }
        }
        const saved = await AsyncStorage.getItem('selectedTreeType');
        if (saved !== null) setSelectedTreeType(Number(saved));
      } catch (err) {
        console.error('fetchTreeType error:', err);
        try {
          const saved = await AsyncStorage.getItem('selectedTreeType');
          if (saved !== null) setSelectedTreeType(Number(saved));
        } catch (_) {}
      }
    };
    fetchTreeType();
  }, []);

  const handleSelectTree = async (type) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API_URL}/api/tree-type`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedTreeType: type }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          Alert.alert('บันทึกไม่สำเร็จ', json.message || `HTTP ${res.status}`);
          return;
        }
      }
      await AsyncStorage.setItem('selectedTreeType', String(type));
      setSelectedTreeType(type);
      setShowTreeModal(false);
    } catch (err) {
      console.error('handleSelectTree error:', err);
      Alert.alert('ข้อผิดพลาด', err.message || 'บันทึกต้นไม้ไม่ได้');
    }
  };

  const saveFeaturesAndClose = async () => {
    await saveFeatures();
    setShowFeatureModal(false);
  };

  // const { logout } = useContext(AuthContext);

  // const handleLogout = async () => {
  //   await logout();
  //   navigation.replace('Login');
  // };

  const { consumed: waterConsumed, waterGoal } = useWater();
  const { steps, stepGoal } = useStep();

  const visibleFeatures = Object.keys(enabledFeatures)
    .filter(key => enabledFeatures[key])
    .map(key => FEATURES.find(f => f.key === key))
    .filter(Boolean);

  const doneCount = visibleFeatures.filter(f => doneMap[f.key]).length;

  // ✅ เปลี่ยนมาใช้ TREE_ASSETS แทน TREE_IMAGES เดิม
  const treeImage = TREE_ASSETS[selectedTreeType][Math.min(doneCount, 5)];

  const waterPct = useMemo(() => {
    const g = Number(waterGoal) || 0;
    const c = Number(waterConsumed) || 0;
    if (g <= 0) return 0;
    return Math.min(100, Math.round((c / g) * 100));
  }, [waterConsumed, waterGoal]);

  const stepPct = useMemo(() => {
    const g = Number(stepGoal) || 0;
    const s = Number(steps) || 0;
    if (g <= 0) return 0;
    return Math.min(100, Math.round((s / g) * 100));
  }, [steps, stepGoal]);

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right']}>
      <HomeHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HomeCircle
          features={visibleFeatures}
          doneMap={doneMap}
          doneCount={doneCount}
          totalCount={visibleFeatures.length}
          treeImage={treeImage}
          onPressFeature={onPressFeature}
          onPressTree={() => setShowTreeModal(true)}
        />

        <View style={styles.featureRowWrap}>
          <HomeFeatureRow features={FEATURES} onPress={onPressFeature} />
          <TouchableOpacity
            style={styles.plusCircle}
            onPress={() => setShowFeatureModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="pulse-outline" size={18} color={GREEN} />
          <Text style={styles.sectionTitle}>สรุปวันนี้</Text>
        </View>

        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: WATER.soft, borderColor: WATER.border }]}
            onPress={() => navigation.navigate('WaterScreen')}
            activeOpacity={0.85}
          >
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIconBg, { backgroundColor: WATER.iconBg }]}>
                <Ionicons name="water" size={22} color={WATER.main} />
              </View>
              <Text style={[styles.summaryLabel, { color: WATER.main }]}>ดื่มน้ำ</Text>
            </View>
            <Text style={[styles.summaryValue, { color: WATER.main }]}>
              {waterConsumed}
              <Text style={styles.summaryUnit}> ml</Text>
            </Text>
            <Text style={styles.summaryTarget}>เป้า {waterGoal} ml · {waterPct}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${waterPct}%`, backgroundColor: WATER.bar }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: STEPS.soft, borderColor: STEPS.border }]}
            onPress={() => navigation.navigate('StepTracker')}
            activeOpacity={0.85}
          >
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIconBg, { backgroundColor: STEPS.iconBg }]}>
                <Ionicons name="footsteps" size={22} color={GREEN} />
              </View>
              <Text style={[styles.summaryLabel, { color: GREEN }]}>ก้าวเดิน</Text>
            </View>
            <Text style={[styles.summaryValue, { color: STEPS.main }]}>
              {steps}
              <Text style={styles.summaryUnit}> ก้าว</Text>
            </Text>
            <Text style={styles.summaryTarget}>เป้า {stepGoal} · {stepPct}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${stepPct}%`, backgroundColor: STEPS.bar }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* <GardenCard /> */}

        {/* ✅ Modal ที่ไม่ใช่ overlay ใส่ใน ScrollView ได้ */}
        <FeatureSelectorModal
          visible={showFeatureModal}
          features={FEATURES}
          enabledFeatures={enabledFeatures}
          onToggle={toggleFeature}
          onClose={() => setShowFeatureModal(false)}
          onSave={() => {
            saveFeatures(enabledFeatures);
            setShowFeatureModal(false);
          }}
        />

        <TreeSelectorModal
          visible={showTreeModal}
          currentType={selectedTreeType}
          onSelect={handleSelectTree}
          onClose={() => setShowTreeModal(false)}
        />

      </ScrollView>
      
      <SleepQuickPicker
        visible={showSleepPicker}
        initialHours={lastSleepHours}
        onSelect={setSleepToday}
        onClose={() => setShowSleepPicker(false)}
      />
      
      <MoodQuickPicker
        visible={showMoodPicker}
        value={mood}
        onSelect={setMoodToday}
        onClose={() => setShowMoodPicker(false)}  
      />

      <View style={[styles.profilePosition, { top: Math.max(insets.top, 8) + 6 }]}>
        <ProfileAvatar size={56} />
      </View>

      {/* <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#000" />
      </TouchableOpacity> */}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  container: {
    flex: 1,
  },
  profilePosition: {
    position: 'absolute',
    right: 18,
    zIndex: 100,
  },
  featureRowWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  plusCircle: {
    position: 'absolute',
    top: -28,
    right: 36,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: GREEN,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.4,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    elevation: 2,
    shadowColor: GREEN,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  summaryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  summaryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryUnit: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
  },
  summaryTarget: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
    fontWeight: '500',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(30, 77, 43, 0.1)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
});