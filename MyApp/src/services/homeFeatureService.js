import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.1.48:3000";

/* ======================
   key สำหรับ cache ต่อ user
====================== */
const getUserKey = async () => {
  const userId = await AsyncStorage.getItem("userId");
  const key = userId ? `HOME_FEATURES_${userId}` : 'HOME_FEATURES_GUEST';

  return key;
};

/* ======================
   โหลดฟีเจอร์ (DB → fallback local)
====================== */
export const getHomeFeatures = async () => {
  const token = await AsyncStorage.getItem("token");

  // 🔥 1. โหลด local ก่อน
  const key = await getUserKey();
  const raw = await AsyncStorage.getItem(key);
  const local = raw ? JSON.parse(raw) : {};


  // 🔥 2. ยิง API
  try {

    const res = await fetch(`${API_URL}/api/features`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("API fail");

    const data = await res.json();

    // 🔥 3. sync ลง local
    await AsyncStorage.setItem(key, JSON.stringify(data));

    return data;
  } catch (err) {
    console.log("API ERROR:", err);
    console.log("USING LOCAL INSTEAD:", local);

    return local;
  }
};

/* ======================
   save ฟีเจอร์ (optimistic update)
====================== */
export const saveHomeFeatures = async (features) => {
  const token = await AsyncStorage.getItem("token");
  const key = await getUserKey();


  // 🔥 1. save local ก่อน
  await AsyncStorage.setItem(key, JSON.stringify(features));

  // 🔥 2. ยิง API
  try {
    const res = await fetch(`${API_URL}/api/features`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(features),
    });

  } catch (err) {
    console.log("SAVE API ERROR:", err);
    console.log("LOCAL ONLY (API FAIL)");
  }

  return features;
};

/* ======================
   toggle helper
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