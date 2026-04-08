import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WaterContext = createContext();

const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const WaterProvider = ({ children }) => {
  const [consumed, setConsumed] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);

  // โหลดข้อมูลวันนี้จาก AsyncStorage
  useEffect(() => {
    const load = async () => {
      try {
        const today = getLocalDateString();
        const saved = await AsyncStorage.getItem('WATER_DATA');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.date === today) {
            setConsumed(parsed.consumed ?? 0);
          } else {
            // วันใหม่ reset
            setConsumed(0);
          }
          setWaterGoal(parsed.goal ?? 2000);
        }
      } catch (e) {
        console.error('Load water error:', e);
      }
    };
    load();
  }, []);

  // บันทึกทุกครั้งที่เปลี่ยน
  useEffect(() => {
    const save = async () => {
      try {
        const today = getLocalDateString();
        await AsyncStorage.setItem('WATER_DATA', JSON.stringify({
          date: today,
          consumed,
          goal: waterGoal,
        }));
      } catch (e) {
        console.error('Save water error:', e);
      }
    };
    save();
  }, [consumed, waterGoal]);

  const addWater = (amount) => {
    setConsumed(prev => Math.min(prev + amount, waterGoal));
  };

  const resetWater = () => setConsumed(0);

  return (
    <WaterContext.Provider value={{ consumed, waterGoal, setWaterGoal, addWater, resetWater }}>
      {children}
    </WaterContext.Provider>
  );
};

export const useWater = () => useContext(WaterContext);