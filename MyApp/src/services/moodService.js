import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'MOODS_BY_DATE';

/* ===== helper ===== */
const loadAll = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
};

const saveAll = async (data) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/* ===== public API ===== */

// ดึง mood ทั้งหมด (Calendar ใช้)
export const getAllMoods = async () => {
  return await loadAll();
};

// ดึง mood ของวันเดียว (Home ใช้)
export const getMoodByDate = async (dateKey) => {
  const moods = await loadAll();
  return moods[dateKey] || null;
};

// บันทึก / แก้ mood
export const setMoodByDate = async (dateKey, mood) => {
  const moods = await loadAll();
  const updated = {
    ...moods,
    [dateKey]: mood,
  };
  await saveAll(updated);
  return updated;
};

// (optional) ลบ mood
export const deleteMoodByDate = async (dateKey) => {
  const moods = await loadAll();
  delete moods[dateKey];
  await saveAll(moods);
  return moods;
};
