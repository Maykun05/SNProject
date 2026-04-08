import React, { createContext, useContext, useState, useEffect, useRef } from 'react'; // ✅ เพิ่ม useRef
import AsyncStorage from '@react-native-async-storage/async-storage';

const LevelContext = createContext();

const LEVEL_NAMES = [
  { min: 1,   max: 3,   emoji: '🌱', name: 'นักสำรวจมือใหม่',   color: '#81C784' },
  { min: 4,   max: 7,   emoji: '🚶', name: 'ผู้เริ่มต้นสุขภาพ',  color: '#4FC3F7' },
  { min: 8,   max: 12,  emoji: '💪', name: 'นักสะสมสุขภาพ',      color: '#FFB74D' },
  { min: 13,  max: 18,  emoji: '🏃', name: 'นักวิ่งชีวิต',        color: '#F06292' },
  { min: 19,  max: 25,  emoji: '⚡', name: 'ผู้เชี่ยวชาญสุขภาพ', color: '#BA68C8' },
  { min: 26,  max: 35,  emoji: '🔥', name: 'นักรบสุขภาพ',         color: '#FF7043' },
  { min: 36,  max: 50,  emoji: '🌟', name: 'ผู้พิชิตร่างกาย',     color: '#FFD700' },
  { min: 51,  max: 75,  emoji: '👑', name: 'เจ้าแห่งสุขภาพ',      color: '#00BCD4' },
  { min: 76,  max: 99,  emoji: '🏆', name: 'ตำนานสุขภาพ',         color: '#FF6F00' },
  { min: 100, max: 999, emoji: '✨', name: 'เทพสุขภาพ',            color: '#E91E63' },
];

export const xpForLevel = (level) => Math.floor(100 * Math.pow(1.3, level - 1));

export const getLevelInfo = (level) => {
  const info = LEVEL_NAMES.find(l => level >= l.min && level <= l.max)
    ?? LEVEL_NAMES[LEVEL_NAMES.length - 1];
  return { ...info, displayName: `${info.emoji} ${info.name}` };
};

export const XP_REWARDS = {
  dailyMission:    30,
  allDailyMission: 50,
  stepGoal:        40,
  waterGoal:       30,
  logSleep:        20,
  logMood:         15,
  logCalorie:      20,
  logWeight:       15,
  weeklyMission:   80,
  monthlyMission:  150,
};

export const LevelProvider = ({ children }) => {
  const [xp, setXp]           = useState(0);
  const [level, setLevel]     = useState(1);
  const [totalXp, setTotalXp] = useState(0);

  // ✅ ใช้ ref เก็บค่า level ปัจจุบันเสมอ แก้ปัญหา stale closure
  const levelRef = useRef(1);
  useEffect(() => { levelRef.current = level; }, [level]);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('LEVEL_DATA');
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedXp    = parsed.xp    ?? 0;
          const savedLevel = parsed.level ?? 1;
          const savedTotal = parsed.totalXp ?? 0;
          setXp(savedXp);
          setLevel(savedLevel);
          setTotalXp(savedTotal);
          levelRef.current = savedLevel; // ✅ sync ref ด้วย
        }
      } catch (e) {
        console.error('Load level error:', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem('LEVEL_DATA', JSON.stringify({ xp, level, totalXp }));
      } catch (e) {
        console.error('Save level error:', e);
      }
    };
    save();
  }, [xp, level, totalXp]);

  // ✅ แก้ addXp ให้ใช้ levelRef.current แทน level (ไม่ stale)
  const addXp = (amount, onLevelUp) => {
    setXp(prevXp => {
      let newXp    = prevXp + amount;
      let newLevel = levelRef.current; // ✅ ใช้ ref แทน
      let leveled  = false;

      while (newXp >= xpForLevel(newLevel)) {
        newXp    -= xpForLevel(newLevel);
        newLevel += 1;
        leveled   = true;
      }

      if (newLevel !== levelRef.current) {
        levelRef.current = newLevel; // ✅ update ref ทันที
        setLevel(newLevel);
        setTotalXp(t => t + amount);
      } else {
        setTotalXp(t => t + amount);
      }

      if (leveled && onLevelUp) {
        // ✅ delay เพื่อให้ state update ก่อน Alert
        setTimeout(() => onLevelUp(newLevel), 100);
      }

      return newXp;
    });
  };

  // ✅ แก้ไขส่วนนี้ — ให้ return number เสมอ ไม่มีทางเป็น boolean
const xpRequired = xpForLevel(level);
const xpPercent = (level > 0 && xpRequired > 0)
  ? Math.min(Math.round((xp / xpRequired) * 100), 100)
  : 0;
const levelInfo = getLevelInfo(level);

  return (
  <LevelContext.Provider
    value={{
      xp,
      level,
      totalXp,
      xpRequired,
      xpPercent,
      levelInfo,
      addXp,
    }}
  >
    {children}
  </LevelContext.Provider>
  );
};

export const useLevel = () => useContext(LevelContext);