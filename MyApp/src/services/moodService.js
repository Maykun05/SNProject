const API_URL = "http://192.168.1.48:3000";

// /* =========================
//    GET ALL (calendar)
// ========================= */
// export const getAllMoods = async (month, year, token) => {
//   const res = await fetch(
//     `${API_URL}/mood/month?month=${month}&year=${year}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch moods");

//   const data = await res.json();

//   // 🔥 แปลง array → object เหมือน AsyncStorage
//   const mapped = {};
//   data.forEach((item) => {
//     const dateKey = item.date.split("T")[0];
//     mapped[dateKey] = item.mood;
//   });

//   return mapped;
// };

// export const getMoodByDate = async (dateKey) => {
//   const res = await fetch(`${API_URL}/api/mood/today`);
//   const data = await res.json();

//   return data?.mood || null;
// };

// export const setMoodByDate = async (dateKey, mood) => {
//   console.log("CALL API:", dateKey, mood); // debug
//   const token = await AsyncStorage.getItem("token");

//   const res = await fetch(`${API_URL}/api/mood`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       mood,
//       date: dateKey,
//     }),
//   });

//   const data = await res.json();
//   console.log("RESPONSE:", data);

//   return data;
// };

// import AsyncStorage from '@react-native-async-storage/async-storage';

// const STORAGE_KEY = 'MOODS_BY_DATE';

// /* ===== helper ===== */
// const loadAll = async () => {
//   const raw = await AsyncStorage.getItem(STORAGE_KEY);
//   return raw ? JSON.parse(raw) : {};
// };

// const saveAll = async (data) => {
//   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
// };

// /* ===== public API ===== */

// // ดึง mood ทั้งหมด (Calendar ใช้)
// export const getAllMoods = async () => {
//   return await loadAll();
// };

// // ดึง mood ของวันเดียว (Home ใช้)
// export const getMoodByDate = async (dateKey) => {
//   const moods = await loadAll();
//   return moods[dateKey] || null;
// };

// // บันทึก / แก้ mood
// export const setMoodByDate = async (dateKey, mood) => {
//   const moods = await loadAll();
//   const updated = {
//     ...moods,
//     [dateKey]: mood,
//   };
//   await saveAll(updated);
//   return updated;
// };

// // (optional) ลบ mood
// export const deleteMoodByDate = async (dateKey) => {
//   const moods = await loadAll();
//   delete moods[dateKey];
//   await saveAll(moods);
//   return moods;
// };

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateKey } from '../utils/dateUtils';

const STORAGE_KEY = 'MOODS_BY_DATE';

/* ================== helper ================== */
const loadLocal = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
};

const saveLocal = async (data) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 🔥 แปลง API → format เดิม
const mapArrayToObject = (data) => {
  const mapped = {};
  data.forEach((item) => {
    const d = new Date(item.date);

    // 🔥 FIX timezone ตรงนี้
    d.setHours(0, 0, 0, 0);

    const key = getLocalDateKey(d);

    mapped[key] = item.mood;
    // const dateKey = item.date.split("T")[0];
    // mapped[dateKey] = item.mood;
  });
  return mapped;
};

/* ================== API ================== */

// โหลดทั้งเดือน
// export const getAllMoods = async (month, year) => {
//   const token = await AsyncStorage.getItem("token");

//   try {
//     const res = await fetch(
//       `${API_URL}/mood/month?month=${month}&year=${year}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!res.ok) throw new Error("API fail");

//     const data = await res.json();

//     const mapped = mapArrayToObject(data);

//     // 🔥 save cache
//     await saveLocal(mapped);

//     return mapped;
//   } catch (err) {
//     console.log("API error → fallback local", err);

//     // 🔥 fallback ใช้ local
//     return await loadLocal();
//   }
// };

export const getAllMoods = async (month, year) => {
  const token = await AsyncStorage.getItem("token");

  // 🔥 1. โหลด local ก่อน (เร็ว)
  const local = await loadLocal();

  // 🔥 2. filter เฉพาะเดือนนั้นจาก local
  const localFiltered = Object.fromEntries(
    Object.entries(local).filter(([dateKey]) => {
      const d = new Date(dateKey + "T00:00:00");
      return (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 // API = 1-12, JS = 0-11
      );
    })
  );

  // 🔥 3. ยิง API (background)
  try {
    const res = await fetch(
      `${API_URL}/api/mood/month?month=${month}&year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("API fail");

    const data = await res.json();
    const mapped = mapArrayToObject(data);

    // 🔥 4. รวมกับ local
    const merged = {
      ...local,
      ...mapped,
    };

    await saveLocal(merged);

    return mapped; // return ของเดือนนั้น
  } catch (err) {
    console.log("⚠️ fallback local", err);
    return localFiltered;
  }
};

// โหลดวันเดียว
export const getMoodByDate = async (dateKey) => {
  const local = await loadLocal();

  // 🔥 ให้ UI render ก่อนเลย
  if (local[dateKey]) return local[dateKey];

  // ค่อยไป fetch
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/mood/today`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data?.mood) {
      const updated = {
        ...local,
        [dateKey]: data.mood,
      };
      await saveLocal(updated);
    }

    return data?.mood || null;
  } catch {
    return null;
  }
};

export const getLocalMoodsForMonth = async (month, year) => {
  const local = await loadLocal();

  return Object.fromEntries(
    Object.entries(local).filter(([dateKey]) => {
      const d = new Date(dateKey);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month - 1
      );
    })
  );
};

// save
// export const setMoodByDate = async (dateKey, mood) => {
//   const token = await AsyncStorage.getItem("token");

//   // 🔥 optimistic update (สำคัญมาก)
//   const local = await loadLocal();
//   const updated = {
//     ...local,
//     [dateKey]: mood,
//   };

//   await saveLocal(updated);

//   try {
//     await fetch(`${API_URL}/api/mood`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         mood,
//         date: dateKey,
//       }),
//     });
//   } catch (err) {
//     console.log("API save fail", err);
//   }

//   return updated;
// };
// 
export const setMoodByDate = async (dateKey, mood) => {
  const token = await AsyncStorage.getItem("token");

  const local = await loadLocal();

  const updated = {
    ...local,
    [dateKey]: mood,
  };

  await saveLocal(updated);

  try {
    await fetch(`${API_URL}/api/mood`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mood,
        date: dateKey,
      }),
    });
  } catch {}

  return updated;
};