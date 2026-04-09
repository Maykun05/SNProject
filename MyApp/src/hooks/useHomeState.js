import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FEATURES } from '../constants/features';
import { getHomeFeatures, saveHomeFeatures } from '../services/homeFeatureService';
import { getMoodByDate, setMoodByDate } from '../services/moodService';
import { getLocalDateKey } from '../utils/dateUtils';
import { saveSleepToDB, getLatestSleep } from '../services/sleepService';

const todayKey = () => getLocalDateKey();

export default function useHomeState({ addXp } = {}) {
  const navigation = useNavigation();
  const { userToken, userId } = useContext(AuthContext);

  const [doneMap, setDoneMap]                 = useState({});
  const [enabledFeatures, setEnabledFeatures] = useState({});
  const [showMoodPicker, setShowMoodPicker]   = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [lastSleepHours, setLastSleepHours]   = useState(6);
  const [mood, setMood] = useState(null);

  const loadTodayStatus = async (featuresOverride) => {
    const today = todayKey();
    const result = {};
    const activeFeatures = featuresOverride || enabledFeatures;

    for (const f of FEATURES.filter(f => activeFeatures[f.key])) {
      if (f.key === 'mood') {
        const mood = await getMoodByDate(today, userToken, userId);
        result.mood = !!mood;
      } else if (f.key === 'sleep') {
        try {
          const latest = await getLatestSleep(userToken);
          result.sleep = !!latest;
          if (latest?.hours) {
            const h = Math.floor(latest.hours);
            const m = Math.round((latest.hours % 1) * 60);
            setLastSleepHours(latest.hours);
          } else {
            setLastSleepHours(6);
          }
          // setLastSleepHours(latest?.hours || 6);
        } catch (err) {
          result.sleep = false;
        }
      } else {
        const value = await AsyncStorage.getItem(`daily_${f.key}_${today}`);
        result[f.key] = !!value;
      }
    }
    setDoneMap(result);
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const features = await getHomeFeatures(userId, userToken);
        setEnabledFeatures(features);
        await loadTodayStatus(features);
      };
      load();
    }, [])
  );

  // ✅ UI ก่อน async
  const markDone = async (key) => {
    setDoneMap(prev => ({ ...prev, [key]: true }));
    try {
      await AsyncStorage.setItem(`daily_${key}_${todayKey()}`, 'true');
    } catch (err) {
      console.log('markDone error:', err);
    }
  };

  const onPressFeature = (f) => {
    switch (f.key) {
      case 'water':
        navigation.navigate('WaterScreen', {
          weight: 60,
          onDone: () => markDone('water'),
        });
        break;
      case 'sleep':
        setShowSleepPicker(true);
        break;
      case 'mood':
        setShowMoodPicker(true);
        break;
      case 'exercise':
        navigation.navigate('Exercise', {
          onDone: () => markDone('exercise'),
        });
        break;
      case 'food':
        navigation.navigate('Calorie');
        break;
      default:
        break;
    }
  };

  const saveFeatures = async (featuresMap) => {
    try {
      await saveHomeFeatures(featuresMap, userId, userToken);
      const fresh = await getHomeFeatures(userId, userToken);
      setEnabledFeatures(fresh);
      await loadTodayStatus(fresh);
    } catch (err) {
      console.log('SAVE FEATURES ERROR:', err);
    }
  };

  // ✅ ปิด + อัป UI ทันที → sync DB ใน background
  const setSleepToday = async (hoursDecimal) => {
    setShowSleepPicker(false);
    setDoneMap(prev => ({ ...prev, sleep: true }));
    if (addXp) addXp(20);
    try {
      await saveSleepToDB(hoursDecimal, userToken);
      await loadTodayStatus(enabledFeatures);
    } catch (err) {
      console.log('setSleepToday error:', err);
    }
  };

  // ✅ ปิด + อัป UI ทันที → sync DB ใน background
  const setMoodToday = async (key) => {
    setShowMoodPicker(false);
    setMood(key); 
    setDoneMap(prev => ({ ...prev, mood: true }));
    if (addXp) addXp(15);
    try {
      await setMoodByDate(todayKey(), key, userToken, userId);
    } catch (err) {
      console.log('setMoodToday error:', err);
    }
  };

  return {
    doneMap,
    enabledFeatures,
    showMoodPicker,
    showSleepPicker,
    setShowSleepPicker,
    setShowMoodPicker,
    showFeatureModal,
    setShowFeatureModal,
    saveFeatures,
    onPressFeature,
    markDone,
    loadTodayStatus,
    setSleepToday,
    setMoodToday,
    mood,
    toggleFeature: (key) => {
      setEnabledFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    },
    lastSleepHours,
  };
}