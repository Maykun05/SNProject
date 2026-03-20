import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeHeader from '../components/home/HomeHeader';
import HomeCircle from '../components/home/HomeCircle';
import HomeFeatureRow from '../components/home/HomeFeatureRow';
import MoodQuickPicker from '../components/home/MoodQuickPicker';
import SleepQuickPicker from '../components/home/SleepQuickPicker';
import FeatureSelectorModal from '../components/home/FeatureSelectorModal';

import { FEATURES } from '../constants/features';
import useHomeState from '../hooks/useHomeState';

import { useNavigation } from '@react-navigation/native';

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
  } = useHomeState();

  const visibleFeatures = FEATURES.filter(
    f => enabledFeatures[f.key] !== false
  );

  const doneCount = visibleFeatures.filter(
    f => doneMap[f.key]
  ).length;

  const treeImage =
    TREE_IMAGES[Math.min(doneCount, TREE_IMAGES.length - 1)];

  return (
    <View style={styles.container}>
      <HomeHeader />

      <HomeCircle
        features={visibleFeatures}
        doneMap={doneMap}
        doneCount={doneCount}
        totalCount={visibleFeatures.length}
        treeImage={treeImage}
        onPressFeature={onPressFeature}
      />

      <TouchableOpacity
        style={styles.plusCircle}
        onPress={() => setShowFeatureModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <HomeFeatureRow
        features={visibleFeatures}
        onPress={onPressFeature}
      />

      <MoodQuickPicker
        visible={showMoodPicker}
        onSelect={setMoodToday}
      />

      <SleepQuickPicker
        visible={showSleepPicker}
        onSelect={setSleepToday}
      />

      <FeatureSelectorModal
        visible={showFeatureModal}
        features={FEATURES}
        enabledFeatures={enabledFeatures}
        onToggle={toggleFeature}
        onClose={() => setShowFeatureModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
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
});
