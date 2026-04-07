import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'; // ✅ เพิ่ม Text, ScrollView
import { Ionicons } from '@expo/vector-icons';

import HomeHeader from '../components/home/HomeHeader';
import HomeCircle from '../components/home/HomeCircle';
import HomeFeatureRow from '../components/home/HomeFeatureRow';
import MoodQuickPicker from '../components/home/MoodQuickPicker';
import SleepQuickPicker from '../components/home/SleepQuickPicker';
import FeatureSelectorModal from '../components/home/FeatureSelectorModal';
import { FEATURES } from '../constants/features';
import useHomeState from '../hooks/useHomeState';
import { AuthContext } from '../context/AuthProvider';

// ✅ [นำมาจากโค้ดแรก] Import ที่เกี่ยวกับ Water, Profile, Step, ProfileAvatar
import ProfileAvatar from '/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/components/home/ProfileAvatar.js';
import { useWater } from '../context/WaterContext';
import { useStep } from '../context/StepContext';
import { useLevel } from '../context/LevelContext';

import GardenCard from '../components/home/GardenCard';

const TREE_IMAGES = [
  require('../assets/tree_0.png'),
  require('../assets/tree_1.png'),
  require('../assets/tree_2.png'),
  require('../assets/tree_3.png'),
  require('../assets/tree_4.png'),
  require('../assets/tree_5.png'),
];


export default function HomeScreen({ navigation }) {
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
    saveFeatures,
  } = useHomeState();

  const saveFeaturesAndClose = async () => {
    await saveFeatures();
    setShowFeatureModal(false);
  };

  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  // ✅ [นำมาจากโค้ดแรก] ดึงข้อมูล Water, Profile, Step
  const { consumed: waterConsumed, waterGoal } = useWater();
  const { steps, stepGoal } = useStep();

  const visibleFeatures = Object.keys(enabledFeatures)
    .filter(key => enabledFeatures[key])
    .map(key => FEATURES.find(f => f.key === key))
    .filter(Boolean);

  const doneCount = visibleFeatures.filter(f => doneMap[f.key]).length;
  const treeImage = TREE_IMAGES[Math.min(doneCount, TREE_IMAGES.length - 1)];
  const { level, xp, xpRequired, xpPercent, levelInfo } = useLevel();

  return (
    // ✅ [นำมาจากโค้ดแรก] เปลี่ยนจาก View เดี่ยว → View root ครอบ + ScrollView ข้างใน
    //    เพื่อให้ ProfileAvatar ลอยอยู่เหนือ ScrollView ได้
    <View style={styles.root}>
      <HomeHeader />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <HomeCircle
          features={visibleFeatures}
          doneMap={doneMap}
          doneCount={doneCount}
          totalCount={visibleFeatures.length}
          treeImage={treeImage}
          onPressFeature={onPressFeature}
        />

        <View style={{ position: 'relative' }}>
          <HomeFeatureRow features={FEATURES} onPress={onPressFeature} />

          <TouchableOpacity
            style={styles.plusCircle}
            onPress={() => setShowFeatureModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ✅ [นำมาจากโค้ดแรก] Summary Cards น้ำ + ก้าวเดิน */}
        <View style={styles.summaryRow}>

          {/* Card น้ำ — กดแล้วไปหน้า WaterScreen */}
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

          {/* Card ก้าวเดิน */}
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

        {/* GardenCard */}
        <GardenCard />

        <MoodQuickPicker visible={showMoodPicker} onSelect={setMoodToday} />

        <SleepQuickPicker
          visible={showSleepPicker}
          initialHours={lastSleepHours}
          onSelect={setSleepToday}
        />

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
      </ScrollView>

      {/* ProfileAvatar ลอยมุมขวาบน อยู่นอก ScrollView */}
      <View style={styles.profilePosition}>
        <ProfileAvatar size={60} />
      </View>

      {/* Logout Button ยังคงอยู่ แต่ปรับตำแหน่งให้ไม่ทับ ProfileAvatar */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#000" />
      </TouchableOpacity>

      
      
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ [นำมาจากโค้ดแรก] root ครอบนอกสุด
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // ✅ [เปลี่ยนจากโค้ดสอง] container ไม่ต้อง flex: 1 + backgroundColor แล้ว เพราะ root จัดการแทน
  container: {
    flex: 1,
    paddingTop: 40,
  },

  // ✅ [นำมาจากโค้ดแรก] ProfileAvatar ลอยมุมขวาบน
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

  // ✅ [นำมาจากโค้ดแรก] ทั้ง block นี้คือ styles ของ Summary Cards
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