const API_URL = "http://192.168.1.48:3000";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateKey } from '../utils/dateUtils';

const STORAGE_KEY = 'MOODS_BY_DATE';
const getUserKey = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) return `${STORAGE_KEY}_GUEST`;
  return `${STORAGE_KEY}_${userId}`;
};
/* ================== helper ================== */
const loadLocal = async () => {
  const key = await getUserKey(); // เปลี่ยนตรงนี้
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
};

const saveLocal = async (data) => {
  const key = await getUserKey(); // เปลี่ยนตรงนี้
  await AsyncStorage.setItem(key, JSON.stringify(data));
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