import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FEATURES } from '../constants/features';
import { getHomeFeatures, saveHomeFeatures } from '../services/homeFeatureService';
import { getMoodByDate, setMoodByDate } from '../services/moodService';
import { getLocalDateKey } from '../utils/dateUtils';
const todayKey = () => getLocalDateKey();

export default function useHomeState() {
  const navigation = useNavigation();

  const [doneMap, setDoneMap] = useState({});
  const [enabledFeatures, setEnabledFeatures] = useState({});
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  const loadTodayStatus = async () => {
    const today = todayKey();
    const result = {};

    for (const f of FEATURES) {
      if (f.key === 'mood') {
        const mood = await getMoodByDate(today);
        result.mood = !!mood;
      } else if (f.key === 'sleep') {
        const value = await AsyncStorage.getItem(
          `daily_sleep_${today}`
        );
        result.sleep = !!value;
      } else {
        const value = await AsyncStorage.getItem(
          `daily_${f.key}_${today}`
        );
        result[f.key] = !!value;
      }
    }

    setDoneMap(result);
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const features = await getHomeFeatures();
        setEnabledFeatures(features);
        await loadTodayStatus();
      };
      load();
    }, [])
  );

  const onPressFeature = (f) => {
    if (f.key === 'mood') {
      setShowMoodPicker(prev => !prev);
      setShowSleepPicker(false);
    } else if (f.key === 'sleep') {
      setShowSleepPicker(prev => !prev);
      setShowMoodPicker(false);
    } else {
      navigation.navigate(f.route);
    }
  };

  return {
    doneMap,
    enabledFeatures,
    showMoodPicker,
    showSleepPicker,
    showFeatureModal,
    setShowFeatureModal,
    onPressFeature,
    loadTodayStatus,
    setMoodToday: async (key) => {
      await setMoodByDate(todayKey(), key);
      await loadTodayStatus();
      setShowMoodPicker(false);
    },
    setSleepToday: async (key) => {
      await AsyncStorage.setItem(
        `daily_sleep_${todayKey()}`,
        key
      );
      await loadTodayStatus();
      setShowSleepPicker(false);
    },
    toggleFeature: async (key) => {
      const updated = {
        ...enabledFeatures,
        [key]: !enabledFeatures[key],
      };
      setEnabledFeatures(updated);
      await saveHomeFeatures(updated);
    },
  };
}
