import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';

const StepContext = createContext();

const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const StepProvider = ({ children }) => {
  const [steps, setSteps]     = useState(0);
  const [stepGoal, setStepGoal] = useState(10000);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

  // ── โหลดข้อมูลจาก AsyncStorage ──
  useEffect(() => {
    const load = async () => {
      try {
        const today = getLocalDateString();
        const saved = await AsyncStorage.getItem('STEP_DATA');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.date === today) {
            setSteps(parsed.steps ?? 0);
          } else {
            setSteps(0); // วันใหม่ reset
          }
          setStepGoal(parsed.goal ?? 10000);
        }
      } catch (e) {
        console.error('Load step error:', e);
      }
    };
    load();
  }, []);

  // ── บันทึกเมื่อ steps เปลี่ยน ──
  useEffect(() => {
    const save = async () => {
      try {
        const today = getLocalDateString();
        await AsyncStorage.setItem('STEP_DATA', JSON.stringify({
          date: today,
          steps,
          goal: stepGoal,
        }));
      } catch (e) {
        console.error('Save step error:', e);
      }
    };
    save();
  }, [steps, stepGoal]);

  // ── ใช้ Pedometer ถ้าเครื่องรองรับ ──
  useEffect(() => {
    let subscription;

    const subscribe = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        // นับก้าวตั้งแต่เที่ยงคืนวันนี้
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();

        // ดึงก้าวสะสมวันนี้ก่อน
        const result = await Pedometer.getStepCountAsync(start, end);
        if (result?.steps) setSteps(result.steps);

        // subscribe real-time
        subscription = Pedometer.watchStepCount(result => {
          setSteps(prev => prev + result.steps);
        });
      }
    };

    subscribe();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return (
    <StepContext.Provider value={{ steps, stepGoal, setStepGoal, isPedometerAvailable }}>
      {children}
    </StepContext.Provider>
  );
};

export const useStep = () => useContext(StepContext);