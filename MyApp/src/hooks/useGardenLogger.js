// src/hooks/useGardenLogger.js
// Hook นี้ใส่ใน feature screen แต่ละหน้า เพื่อ log อัตโนมัติเมื่อ user ทำกิจกรรมเสร็จ

import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { useGarden } from '../context/GardenContext';

/**
 * ใช้ใน feature screen แต่ละอัน
 * @param {string} featureKey  - canonical: 'water' | 'food' | 'mood' | 'sleep' | 'exercise' (backend รองรับ legacy calorie/step)
 *
 * @example
 * // ใน CalorieScreen.js
 * const { logAndCheck } = useGardenLogger('calorie');
 * // เรียกเมื่อ user save ข้อมูลสำเร็จ:
 * await logAndCheck();
 */
export const useGardenLogger = (featureKey) => {
  const { logFeature, todayProgress } = useGarden();
  const treeAnimRef = useRef(new Animated.Value(0)).current;

  const logAndCheck = useCallback(async () => {
    // ถ้า log feature นี้ไปแล้ววันนี้ ไม่ต้อง call API ซ้ำ
    const alreadyLogged = todayProgress?.completedFeatures?.includes(featureKey);
    if (alreadyLogged) return null;

    const result = await logFeature(featureKey);
    return result; // { completedToday, allCompleted, treeGrown, treeCount }
  }, [featureKey, logFeature, todayProgress]);

  return {
    logAndCheck,
    treeAnimRef,
    isLoggedToday: todayProgress?.completedFeatures?.includes(featureKey) ?? false,
  };
};