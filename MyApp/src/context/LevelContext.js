import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LevelContext = createContext();

// ── ชื่อเลเวลตาม level ──
const LEVEL_NAMES = [
  { min: 1,  max: 3,   name: '🌱 นักสำรวจมือใหม่',    color: '#81C784' },
  { min: 4,  max: 7,   name: '🚶 ผู้เริ่มต้นสุขภาพ',   color: '#4FC3F7' },
  { min: 8,  max: 12,  name: '💪 นักสะสมสุขภาพ',       color: '#FFB74D' },
  { min: 13, max: 18,  name: '🏃 นักวิ่งชีวิต',         color: '#F06292' },
  { min: 19, max: 25,  name: '⚡ ผู้เชี่ยวชาญสุขภาพ',  color: '#BA68C8' },
  { min: 26, max: 35,  name: '🔥 นักรบสุขภาพ',          color: '#FF7043' },
  { min: 36, max: 50,  name: '🌟 ผู้พิชิตร่างกาย',      color: '#FFD700' },
  { min: 51, max: 75,  name: '👑 เจ้าแห่งสุขภาพ',       color: '#00BCD4' },
  { min: 76, max: 99,  name: '🏆 ตำนานสุขภาพ',          color: '#FF6F00' },
  { min: 100,max: 999, name: '✨ เทพสุขภาพ',             color: '#E91E63' },
];

// XP ที่ต้องการต่อเลเวล (เพิ่มขึ้นเรื่อยๆ)
export const xpForLevel = (level) => Math.floor(100 * Math.pow(1.3, level - 1));

export const getLevelInfo = (level) => {
  const info = LEVEL_NAMES.find(l => level >= l.min && level <= l.max)
    || LEVEL_NAMES[LEVEL_NAMES.length - 1];
  return info;
};

// XP ที่ได้จากแต่ละกิจกรรม
export const XP_REWARDS = {
  dailyMission:    30,  // เสร็จภารกิจประจำวัน 1 ข้อ
  allDailyMission: 50,  // เสร็จภารกิจครบทุกข้อ
  stepGoal:        40,  // เดินครบเป้าหมายก้าว
  waterGoal:       30,  // ดื่มน้ำครบเป้าหมาย
  logSleep:        20,  // บันทึกการนอน
  logMood:         15,  // บันทึกอารมณ์
  logCalorie:      20,  // บันทึกแคลอรี่
  logWeight:       15,  // บันทึกน้ำหนัก
  weeklyMission:   80,  // เสร็จภารกิจรายสัปดาห์
  monthlyMission:  150, // เสร็จภารกิจรายเดือน
};

export const LevelProvider = ({ children }) => {
  const [xp, setXp]       = useState(0);
  const [level, setLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0); // XP สะสมทั้งหมด

  // โหลดข้อมูลจาก AsyncStorage
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('LEVEL_DATA');
        if (saved) {
          const parsed = JSON.parse(saved);
          setXp(parsed.xp ?? 0);
          setLevel(parsed.level ?? 1);
          setTotalXp(parsed.totalXp ?? 0);
        }
      } catch (e) {
        console.error('Load level error:', e);
      }
    };
    load();
  }, []);

  // บันทึกเมื่อเปลี่ยน
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

  // เพิ่ม XP และคำนวณ level up
  const addXp = (amount, onLevelUp) => {
    setXp(prev => {
      let newXp    = prev + amount;
      let newLevel = level;
      let leveled  = false;

      // level up loop
      while (newXp >= xpForLevel(newLevel)) {
        newXp    -= xpForLevel(newLevel);
        newLevel += 1;
        leveled   = true;
      }

      setLevel(newLevel);
      setTotalXp(t => t + amount);

      if (leveled && onLevelUp) {
        onLevelUp(newLevel);
      }

      return newXp;
    });
  };

  const xpRequired    = xpForLevel(level);
  const xpPercent     = Math.min(Math.round((xp / xpRequired) * 100), 100);
  const levelInfo     = getLevelInfo(level);

  return (
    <LevelContext.Provider value={{
      xp, level, totalXp,
      xpRequired, xpPercent,
      levelInfo,
      addXp,
    }}>
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => useContext(LevelContext);