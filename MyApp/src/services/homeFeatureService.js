import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HOME_FEATURES';

/* ======================
   ค่าเริ่มต้น (ครั้งแรก)
====================== */
const DEFAULT_FEATURES = {
  mood: true,
  exercise: true,
  water: true,
  sleep: true,
  calorie: true,
};

/* ======================
   โหลดฟีเจอร์ที่เลือก
====================== */
export const getHomeFeatures = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }

    // ถ้ายังไม่เคยมี → set ค่า default
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_FEATURES)
    );
    return DEFAULT_FEATURES;
  } catch (err) {
    console.error('getHomeFeatures error:', err);
    return DEFAULT_FEATURES;
  }
};

/* ======================
   บันทึกฟีเจอร์ที่เลือก
====================== */
export const saveHomeFeatures = async (features) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(features)
    );
    return features;
  } catch (err) {
    console.error('saveHomeFeatures error:', err);
    return features;
  }
};

/* ======================
   toggle ฟีเจอร์ (optional helper)
====================== */
export const toggleHomeFeature = async (featureKey) => {
  const current = await getHomeFeatures();
  const updated = {
    ...current,
    [featureKey]: !current[featureKey],
  };
  await saveHomeFeatures(updated);
  return updated;
};
