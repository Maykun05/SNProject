import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FEATURES } from '../constants/features';
import { getHomeFeatures, saveHomeFeatures } from '../services/homeFeatureService';
import { getMoodByDate, setMoodByDate } from '../services/moodService';
import { getLocalDateKey } from '../utils/dateUtils';
import { saveSleepToDB, getLatestSleep} from '../services/sleepService';

const todayKey = () => getLocalDateKey();

export default function useHomeState() {
  const navigation = useNavigation();
  const { userToken, userId } = useContext(AuthContext);
  const [doneMap, setDoneMap] = useState({});
  const [enabledFeatures, setEnabledFeatures] = useState({});
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [lastSleepHours, setLastSleepHours] = useState(6);

  const loadTodayStatus = async (featuresOverride) => {
    const today = todayKey();
    const result = {};

    // 🔹 ใช้เฉพาะฟีเจอร์ที่เลือก (enabledFeatures)
    const activeFeatures = featuresOverride || enabledFeatures;

    for (const f of FEATURES.filter(f => activeFeatures[f.key])) {
      if (f.key === 'mood') {
        const mood = await getMoodByDate(today, userToken, userId);
        result.mood = !!mood;
      } else if (f.key === 'sleep') {
        try {
          const latest = await getLatestSleep(userToken);
          result.sleep = !!latest;
          setLastSleepHours(latest?.hours || 6);
        } catch (err) {
          result.sleep = false;
        }
      } else {
        const value = await AsyncStorage.getItem(`daily_${f.key}_${today}`);
        result[f.key] = !!value;
      }
    }

    setDoneMap(result); // ✅ อัปเดตเฉพาะฟีเจอร์ที่เลือก
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

  const onPressFeature = (f) => {
    if (f.key === 'mood') {
      setShowMoodPicker(prev => !prev);
      setShowSleepPicker(false);
    } else if (f.key === 'sleep') {
      setShowSleepPicker(prev => !prev);
      setShowMoodPicker(false);
    } else if (f.key === 'water') {
      navigation.navigate('WaterScreen');
    } else {
      navigation.navigate(f.route);
    }
  };

  const saveFeatures = async (featuresMap) => {
    try {
      await saveHomeFeatures(featuresMap, userId, userToken);
      const fresh = await getHomeFeatures(userId, userToken);
      setEnabledFeatures(fresh);
      await loadTodayStatus(fresh);
    } catch (err) {
      console.log("SAVE FEATURES ERROR:", err);
    }
  };


  return {
    doneMap,
    enabledFeatures,
    showMoodPicker,
    showSleepPicker,
    showFeatureModal,
    saveFeatures,
    setShowFeatureModal,
    onPressFeature,
    loadTodayStatus,
    setMoodToday: async (key) => {
      console.log("SELECT MOOD:", key);
      await setMoodByDate(todayKey(), key, userToken, userId);
      await loadTodayStatus();
      setShowMoodPicker(false);
    },
    setSleepToday: async (hours) => {
      await saveSleepToDB(hours, userToken); // เรียก service
      await loadTodayStatus();
      setShowSleepPicker(false);
    },

    toggleFeature: (key) => {
      setEnabledFeatures(prev => ({
        ...prev,
        [key]: !prev[key],   // ✅ flip ค่าใน local state เท่านั้น
      }));
    },

    lastSleepHours,

  };
}
