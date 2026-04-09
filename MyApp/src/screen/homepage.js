import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { AuthContext } from '../context/AuthProvider';

import ProfileAvatar from '/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/components/home/ProfileAvatar.js';
import { useWater } from '../context/WaterContext';
import { useStep } from '../context/StepContext';
import { useLevel } from '../context/LevelContext';

import GardenCard from '../components/home/GardenCard';

export default function HomeScreen({ navigation }) {
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
  } = useHomeState();

  // ✅ State สำหรับเลือกแบบต้นไม้
  const [selectedTreeType, setSelectedTreeType] = useState(1);
  const [showTreeModal, setShowTreeModal] = useState(false);


  // ✅ โหลด tree type จาก AsyncStorage แทน backend
  useEffect(() => {
    const fetchTreeType = async () => {
      try {
        const saved = await AsyncStorage.getItem('selectedTreeType');
        if (saved !== null) setSelectedTreeType(Number(saved));
      } catch (err) {
        console.error('fetchTreeType error:', err);
      }
    };
    fetchTreeType();
  }, []);

  // ✅ บันทึก tree type ลง AsyncStorage แทน backend
  const handleSelectTree = async (type) => {
    try {
      await AsyncStorage.setItem('selectedTreeType', String(type));
      setSelectedTreeType(type);
      setShowTreeModal(false);
    } catch (err) {
      console.error('handleSelectTree error:', err);
    }
  };

  const handlePressFeature = (feature) => {
  if (feature.key === 'exercise') {
    navigation.navigate('StepTracker', {
      onDone: () => {                    // ✅ callback กลับมา markDone
        onPressFeature(feature);         // เรียก markDone ใน useHomeState
      },
    });
    return;
  }
  onPressFeature(feature);
};

  const saveFeaturesAndClose = async () => {
    await saveFeatures();
    setShowFeatureModal(false);
  };

  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const { consumed: waterConsumed, waterGoal } = useWater();
  const { steps, stepGoal } = useStep();

  const visibleFeatures = Object.keys(enabledFeatures)
    .filter(key => enabledFeatures[key])
    .map(key => FEATURES.find(f => f.key === key))
    .filter(Boolean);

  const doneCount = visibleFeatures.filter(f => doneMap[f.key]).length;

  // ✅ เปลี่ยนมาใช้ TREE_ASSETS แทน TREE_IMAGES เดิม
  const treeImage = TREE_ASSETS[selectedTreeType][Math.min(doneCount, 5)];

  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel();
  const [sleepHours, setSleepHours] = useState(null);

  return (
    <View style={styles.root}>
      <HomeHeader />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

        <HomeCircle
          features={visibleFeatures}
          doneMap={doneMap}
          doneCount={doneCount}
          totalCount={visibleFeatures.length}
          treeImage={treeImage}
          onPressFeature={handlePressFeature}
          onPressTree={() => setShowTreeModal(true)}
        />

        <View style={{ position: 'relative' }}>
          <HomeFeatureRow features={FEATURES} onPress={handlePressFeature} />
          <TouchableOpacity
            style={styles.plusCircle}
            onPress={() => setShowFeatureModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: '#EEF2FF' }]}
            onPress={() => navigation.navigate('WaterScreen', { weight: 60 })}
            activeOpacity={0.8}
          >
            <Text style={[styles.summaryLabel, { color: '#3B5BDB' }]}>น้ำ</Text>
            <View style={styles.ringWrapper}>
              <View style={[styles.ringOuter, { borderColor: '#C5CFFF' }]}>
                <View style={[styles.ringInner, { borderColor: '#4A90E2', borderTopColor: 'transparent' }]}>
                  <Ionicons name="water" size={26} color="#4A90E2" />
                </View>
              </View>
            </View>
            <Text style={[styles.summaryValue, { color: '#3B5BDB' }]}>{waterConsumed}</Text>
            <Text style={styles.summaryTarget}>/ {waterGoal} ml</Text>
          </TouchableOpacity>

          <View style={[styles.summaryCard, { backgroundColor: '#FFF8EC' }]}>
            <Text style={[styles.summaryLabel, { color: '#E07B00' }]}>จำนวนก้าวเดิน</Text>
            <View style={styles.ringWrapper}>
              <View style={[styles.ringOuter, { borderColor: '#FFE0B2' }]}>
                <View style={[styles.ringInner, { borderColor: '#FF9800', borderTopColor: 'transparent' }]}>
                  <Ionicons name="footsteps" size={26} color="#FF9800" />
                </View>
              </View>
            </View>
            <Text style={[styles.summaryValue, { color: '#E07B00' }]}>{steps}</Text>
            <Text style={styles.summaryTarget}>/ {stepGoal}</Text>
          </View>
        </View>

        <GardenCard />

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

      {/* ✅ ย้าย SleepQuickPicker และ MoodQuickPicker ออกนอก ScrollView */}
      <SleepQuickPicker
        visible={showSleepPicker}
        initialHours={lastSleepHours}
        onSelect={setSleepToday}
        onClose={() => setShowSleepPicker(false)}
      />

      <MoodQuickPicker
        visible={showMoodPicker}
        onSelect={setMoodToday}
        onClose={() => setShowMoodPicker(false)}  // ✅ เพิ่ม onClose
      />

      <View style={styles.profilePosition}>
        <ProfileAvatar size={60} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#000" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  profilePosition: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 100,
  },
  plusCircle: {
    position: 'absolute',
    top: -30,
    right: 40,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#abb9a7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  ringWrapper: {
    marginVertical: 8,
  },
  ringOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  summaryTarget: {
    fontSize: 13,
    color: '#999',
  },
});