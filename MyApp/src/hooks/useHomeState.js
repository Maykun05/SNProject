import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FEATURES } from '../constants/features';
import { getHomeFeatures, saveHomeFeatures } from '../services/homeFeatureService';
import { getMoodByDate, setMoodByDate } from '../services/moodService';
import { getLocalDateKey } from '../utils/dateUtils';
import { saveSleepToDB, getLatestSleep } from '../services/sleepService';

import { useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';

const todayKey = () => getLocalDateKey();

export default function useHomeState({ addXp, openExercisePicker } = {}) {
  const navigation = useNavigation();
  const { userToken, userId } = useContext(AuthContext);

  const [doneMap, setDoneMap]                 = useState({});
  const [enabledFeatures, setEnabledFeatures] = useState({});
  const [showMoodPicker, setShowMoodPicker]   = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [lastSleepHours, setLastSleepHours]   = useState(6);

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
    const today = todayKey();
    // ✅ เช็ค local ก่อนเสมอ
    const localDone = await AsyncStorage.getItem(`daily_sleep_${today}`);
    if (localDone) {
      result.sleep = true;
    } else {
      const latest = await getLatestSleep(userToken);
      // ✅ ตรวจว่า sleep นั้นเป็นของวันนี้จริงๆ
      if (latest) {
        const sleepDate = getLocalDateKey(new Date(latest.createdAt || latest.date));
        result.sleep = sleepDate === today;
        if (result.sleep) {
          setLastSleepHours(latest?.hours || 6);
          // ✅ บันทึก local ด้วยเพื่อกันเด้งรอบต่อไป
          await AsyncStorage.setItem(`daily_sleep_${today}`, 'true');
        }
      } else {
        result.sleep = false;
      }
    }
  } catch {
    result.sleep = false;
  }
}
else {
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
      if (openExercisePicker) {
        openExercisePicker();
      } else {
        // ✅ ถ้าไม่มี picker ให้ markDone ตรง (ถูกเรียกจาก onDone callback)
        markDone('exercise');
      }
      break;
      case 'calorie':
      navigation.navigate('CalorieScreen', {  // ✅ ต้องตรงกับ name ใน Stack
        onDone: () => markDone('calorie'),
      });
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
  const setSleepToday = async (hours) => {
  setShowSleepPicker(false);
  setDoneMap(prev => ({ ...prev, sleep: true }));
  if (addXp) addXp(20);
  try {
    // ✅ บันทึก local ทันที กันเด้ง
    await AsyncStorage.setItem(`daily_sleep_${todayKey()}`, 'true');
    await saveSleepToDB(hours, userToken);
  } catch (err) {
    console.log('setSleepToday error:', err);
  }
};

  // ✅ ปิด + อัป UI ทันที → sync DB ใน background
  const setMoodToday = async (key) => {
    setShowMoodPicker(false);
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
    toggleFeature: (key) => {
      setEnabledFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    },
    lastSleepHours,
  };
}