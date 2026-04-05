import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

/* ======================
   key สำหรับ cache ต่อ user
====================== */
const getUserKey = async (userId) => {
  const key = userId ? `HOME_FEATURES_${userId}` : 'HOME_FEATURES_GUEST';
  return key;
};

/* ======================
   โหลดฟีเจอร์ (DB → fallback local)
====================== */
export const getHomeFeatures = async (userId, userToken) => {
  //  1. โหลด local ก่อน
  const key = await getUserKey(userId);
  const raw = await AsyncStorage.getItem(key);
  const local = raw ? JSON.parse(raw) : {};

  //  2. ยิง API
  try {

    const res = await fetch(`${API_URL}/api/features`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!res.ok) throw new Error("API fail");

    const data = await res.json();

    // 3. sync ลง local
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
// export const saveHomeFeatures = async (features,userId, userToken) => {
//   const key = await getUserKey(userId);
//   // 🔥 1. save local ก่อน
//   await AsyncStorage.setItem(key, JSON.stringify(features));

//   // 🔥 2. ยิง API
//   try {
//     const res = await fetch(`${API_URL}/api/features`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${userToken}`,
//       },
//       body: JSON.stringify(features),
//     });

//   } catch (err) {
//     console.log("SAVE API ERROR:", err);
//     console.log("LOCAL ONLY (API FAIL)");
//   }

//   return features;
// };
export const saveHomeFeatures = async (featuresMap, userId, userToken) => {
  const key = await getUserKey(userId);
  await AsyncStorage.setItem(key, JSON.stringify(featuresMap));

  try {
    const featureIds = Object.keys(featuresMap)
      .filter(key => featuresMap[key]) // เอาเฉพาะที่ true
      .map(key => FEATURES.find(f => f.key === key)?.id); // map ไปเป็น id

    const res = await fetch(`${API_URL}/user/features`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ features: featureIds }), // ✅ ส่ง array
    });

    if (!res.ok) throw new Error("API fail");
  } catch (err) {
    console.log("SAVE API ERROR:", err);
  }

  return featuresMap;
};


/* ======================
   toggle helper
====================== */
export const toggleHomeFeature = async (featureKey, userId, userToken) => {

  const current = await getHomeFeatures(userId, userToken);

  const updated = {
    ...current,
    [featureKey]: !current[featureKey],
  };

  await saveHomeFeatures(updated, userToken);

  return updated;
};