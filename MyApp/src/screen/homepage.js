import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'; // ✅ เพิ่ม TouchableOpacity
import { Ionicons } from '@expo/vector-icons';

import HomeHeader from '../components/home/HomeHeader';
import HomeCircle from '../components/home/HomeCircle';
import HomeFeatureRow from '../components/home/HomeFeatureRow';
import MoodQuickPicker from '../components/home/MoodQuickPicker';
import SleepQuickPicker from '../components/home/SleepQuickPicker';
import FeatureSelectorModal from '../components/home/FeatureSelectorModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEATURES } from '../constants/features';
import useHomeState from '../hooks/useHomeState';

import ProfileAvatar from '../components/ProfileAvatar';
import { useWater } from '../context/WaterContext';
import { useProfile } from '../context/ProfileContext'; // ✅ เพิ่ม
import { useStep } from '../context/StepContext';


const TREE_IMAGES = [
  require('../assets/tree_0.png'),
  require('../assets/tree_1.png'),
  require('../assets/tree_2.png'),
  require('../assets/tree_3.png'),
  require('../assets/tree_4.png'),
  require('../assets/tree_5.png'),
];

export default function HomeScreen({ navigation }) { // ✅ รับ navigation
  const {
    doneMap, 
    enabledFeatures,
    showMoodPicker, 
    showSleepPicker, 
    showFeatureModal,
    setShowFeatureModal, 
    onPressFeature,
    setMoodToday, 
    setSleepToday, 
    toggleFeature,
    lastSleepHours,
  } = useHomeState();

  const { consumed: waterConsumed, waterGoal } = useWater();
  const { profile } = useProfile(); // ✅ ดึง profile สำหรับน้ำหนัก

  const visibleFeatures = Object.keys(enabledFeatures)
    .filter(key => enabledFeatures[key])
    .map(key => FEATURES.find(f => f.key === key))
    .filter(Boolean);

  const doneCount = visibleFeatures.filter(f => doneMap[f.key]).length;
  const treeImage = TREE_IMAGES[Math.min(doneCount, TREE_IMAGES.length - 1)];
  const { steps, stepGoal } = useStep();

  return (
    // ✅ ใช้ View ครอบนอกสุด เพื่อให้ ProfileAvatar fix position ได้ถูกต้อง
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <HomeHeader />
      
        <HomeCircle
          features={visibleFeatures}
          doneMap={doneMap}
          doneCount={doneCount}
          totalCount={visibleFeatures.length}
          treeImage={treeImage}
          onPressFeature={onPressFeature}
        />

        <View style={styles.plusCircle}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>

        <HomeFeatureRow features={FEATURES} onPress={onPressFeature} />

        {/* ── Summary Cards ── */}
        <View style={styles.summaryRow}>

          {/* ✅ Card น้ำ — กดแล้วไปหน้า WaterScreen */}
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: '#EEF2FF' }]}
            onPress={() => navigation.navigate('WaterScreen', { weight: profile.weight ?? 60 })}
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

          {/* ✅ Card ขั้นตอน — เปลี่ยนจากน้ำหนักเป็นก้าวเดิน สีส้ม */}
            <View style={[styles.summaryCard, { backgroundColor: '#FFF8EC' }]}>
              <Text style={[styles.summaryLabel, { color: '#E07B00' }]}>ขั้นตอน</Text>
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

        <MoodQuickPicker visible={showMoodPicker} onSelect={setMoodToday} />
        <SleepQuickPicker visible={showSleepPicker} onSelect={setSleepToday} />
        <FeatureSelectorModal
          visible={showFeatureModal}
          features={FEATURES}
          enabledFeatures={enabledFeatures}
          onToggle={toggleFeature}
          onClose={() => setShowFeatureModal(false)}
        />
      </ScrollView>

      {/* ✅ ย้าย ProfileAvatar มาอยู่ใน View root
          เพื่อให้ fix position บนขวาสุดของหน้าจอได้จริง
          ไม่ถูก ScrollView บัง */}
      <View style={styles.profilePosition}>
        <ProfileAvatar size={60} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ root ครอบนอกสุด ให้ ProfileAvatar fix ได้ถูกต้อง
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },

  // ✅ ใช้ SafeAreaView-aware position
  profilePosition: {
    position: 'absolute',
    top: 50,       // ปรับตามความสูง status bar ของเครื่อง
    right: 16,     // ✅ ชิดขวาสุด
    zIndex: 100,   // ✅ ให้อยู่เหนือทุก component
  },

  plusCircle: {
    position: 'absolute',
    bottom: 550,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#abb9a7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Summary Cards ── */
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