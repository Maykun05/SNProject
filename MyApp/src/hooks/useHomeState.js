import { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FEATURES } from '../constants/features';
import { getHomeFeatures, saveHomeFeatures } from '../services/homeFeatureService';
import { getMoodByDate, setMoodByDate } from '../services/moodService';
import { getLocalDateKey } from '../utils/dateUtils';
import { saveSleepToDB, getLatestSleep } from '../services/sleepService';
import { useGarden } from '../context/GardenContext';
import { HOME_FEATURE_XP } from '../context/LevelContext';

const todayKey = () => getLocalDateKey();

export default function useHomeState({ addXp } = {}) {
  const navigation = useNavigation();
  const { userToken, userId } = useContext(AuthContext);
  const { fetchTodayProgress, logFeature } = useGarden();

  const [doneMap, setDoneMap]                 = useState({});
  const [enabledFeatures, setEnabledFeatures] = useState({});
  const [showMoodPicker, setShowMoodPicker]   = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [lastSleepHours, setLastSleepHours]   = useState(6);
  const [mood, setMood] = useState(null);

  const enabledFeaturesRef = useRef(enabledFeatures);
  /** กันจ่าย XP ซ้ำวันเดียวกัน (เช่น รีโหลดหน้า Exercise แล้ว onDone ยิงอีก) */
  const homeFeatureXpGrantedRef = useRef({ date: null, keys: new Set() });

  useEffect(() => {
    enabledFeaturesRef.current = enabledFeatures;
  }, [enabledFeatures]);

  const tryGrantHomeFeatureXp = async (key) => {
    if (!userToken || !addXp) return;
    const d = todayKey();
    if (homeFeatureXpGrantedRef.current.date !== d) {
      homeFeatureXpGrantedRef.current = { date: d, keys: new Set() };
    }
    if (homeFeatureXpGrantedRef.current.keys.has(key)) return;
    homeFeatureXpGrantedRef.current.keys.add(key);
    await addXp(HOME_FEATURE_XP);
  };

  const loadTodayStatus = useCallback(async (featuresOverride) => {
    const today = todayKey();
    const result = {};
    const activeFeatures = featuresOverride ?? enabledFeaturesRef.current;
    const filtered = FEATURES.filter((f) => activeFeatures[f.key]);

    if (!userToken) {
      for (const f of filtered) {
        if (f.key === 'mood') {
          const moodVal = await getMoodByDate(today, userToken, userId);
          result.mood = !!moodVal;
        } else if (f.key === 'sleep') {
          try {
            const latest = await getLatestSleep(userToken);
            result.sleep = !!latest;
            if (latest?.hours) {
              setLastSleepHours(latest.hours);
            } else {
              setLastSleepHours(6);
            }
          } catch (err) {
            result.sleep = false;
          }
        } else {
          const value = await AsyncStorage.getItem(`daily_${f.key}_${today}`);
          result[f.key] = !!value;
        }
      }
      setDoneMap(result);
      return;
    }

    try {
      const progress = await fetchTodayProgress();
      const completed = new Set(progress?.completedFeatures ?? []);
      for (const f of filtered) {
        result[f.key] = completed.has(f.key);
      }
      if (filtered.some((f) => f.key === 'sleep')) {
        try {
          const latest = await getLatestSleep(userToken);
          if (latest?.hours) setLastSleepHours(latest.hours);
        } catch (_) { /* keep previous */ }
      }
      setDoneMap(result);
    } catch (err) {
      console.log('loadTodayStatus API fallback:', err);
      for (const f of filtered) {
        if (f.key === 'mood') {
          const moodVal = await getMoodByDate(today, userToken, userId);
          result.mood = !!moodVal;
        } else if (f.key === 'sleep') {
          try {
            const latest = await getLatestSleep(userToken);
            result.sleep = !!latest;
            if (latest?.hours) setLastSleepHours(latest.hours);
          } catch (e) {
            result.sleep = false;
          }
        } else {
          const value = await AsyncStorage.getItem(`daily_${f.key}_${today}`);
          result[f.key] = !!value;
        }
      }
      setDoneMap(result);
    }
  }, [userToken, userId, fetchTodayProgress]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const features = await getHomeFeatures(userId, userToken);
        setEnabledFeatures(features);
        await loadTodayStatus(features);
      };
      load();
    }, [userId, userToken, loadTodayStatus])
  );

  const markDone = async (key) => {
    setDoneMap((prev) => ({ ...prev, [key]: true }));
    if (!userToken) {
      try {
        await AsyncStorage.setItem(`daily_${key}_${todayKey()}`, 'true');
      } catch (err) {
        console.log('markDone error:', err);
      }
    }
  };

  /** หลังฟีเจอร์ครบเงื่อนไข (จากหน้าอื่น) — อัปเดต doneMap + XP บนเซิร์ฟเวอร์ */
  const onHomeFeatureGoalMet = async (key) => {
    await markDone(key);
    await tryGrantHomeFeatureXp(key);
  };

  const onPressFeature = (f) => {
    switch (f.key) {
      case 'water':
        navigation.navigate('WaterScreen', {
          onDone: () => onHomeFeatureGoalMet('water'),
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
          onDone: () => onHomeFeatureGoalMet('exercise'),
        });
        break;
      case 'food':
        navigation.navigate('Calorie', {
          onDone: () => onHomeFeatureGoalMet('food'),
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

  const setSleepToday = async (hoursDecimal) => {
    setShowSleepPicker(false);
    setDoneMap((prev) => ({ ...prev, sleep: true }));
    try {
      await saveSleepToDB(hoursDecimal, userToken);
      await tryGrantHomeFeatureXp('sleep');
      const logged = await logFeature('sleep');
      const fresh = await getHomeFeatures(userId, userToken);
      await loadTodayStatus(fresh);
      if (!logged) {
        setDoneMap((prev) => ({ ...prev, sleep: true }));
      }
    } catch (err) {
      console.log('setSleepToday error:', err);
    }
  };

  const setMoodToday = async (key) => {
    setShowMoodPicker(false);
    setMood(key);
    setDoneMap((prev) => ({ ...prev, mood: true }));
    try {
      await setMoodByDate(todayKey(), key, userToken, userId);
      await tryGrantHomeFeatureXp('mood');
      const logged = await logFeature('mood');
      const fresh = await getHomeFeatures(userId, userToken);
      await loadTodayStatus(fresh);
      if (!logged) {
        setDoneMap((prev) => ({ ...prev, mood: true }));
      }
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
      setEnabledFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    lastSleepHours,
  };
}
