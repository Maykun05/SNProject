import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthProvider';
import { useProfile } from './ProfileContext';
import { fetchWaterToday, postWaterLog, deleteWaterLog, putProfileWaterGoal, localCalendarDay } from '../services/waterApi';

const WaterContext = createContext();

const STORAGE_KEY = 'WATER_DATA';

export const WaterProvider = ({ children }) => {
  const { userToken } = useContext(AuthContext);
  const { updateProfile } = useProfile();
  const [consumed, setConsumed] = useState(0);
  const [waterGoal, setWaterGoalState] = useState(2000);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(async () => {
    const today = localCalendarDay();
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setConsumed(parsed.consumed ?? 0);
        } else {
          setConsumed(0);
        }
        setWaterGoalState(parsed.goal ?? 2000);
      }
    } catch (e) {
      console.error('Load water (local) error:', e);
    }
  }, []);

  const syncFromApi = useCallback(async () => {
    if (!userToken) return null;
    const day = localCalendarDay();
    try {
      const data = await fetchWaterToday(userToken, day);
      setConsumed(data.consumed ?? 0);
      setWaterGoalState(data.waterGoal ?? 2000);
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      return data;
    } catch (e) {
      console.error('Sync water from API error:', e);
      await loadFromStorage();
      return null;
    }
  }, [userToken, loadFromStorage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (userToken) {
        await syncFromApi();
      } else {
        await loadFromStorage();
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userToken, syncFromApi, loadFromStorage]);

  useEffect(() => {
    if (userToken) return;
    const save = async () => {
      try {
        const today = localCalendarDay();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          date: today,
          consumed,
          goal: waterGoal,
        }));
      } catch (e) {
        console.error('Save water (local) error:', e);
      }
    };
    save();
  }, [consumed, waterGoal, userToken]);

  const setWaterGoal = async (goal) => {
    const n = Number(goal);
    if (!Number.isFinite(n)) return;
    const rounded = Math.round(n);
    setWaterGoalState(rounded);
    if (userToken) {
      try {
        await putProfileWaterGoal(userToken, rounded);
        const data = await syncFromApi();
        const canonical = data?.waterGoal ?? rounded;
        updateProfile({ waterGoal: canonical });
      } catch (e) {
        console.error('putProfileWaterGoal:', e);
      }
      return;
    }
    updateProfile({ waterGoal: rounded });
  };

  const addWater = async (amount) => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return;

    if (userToken) {
      try {
        const day = localCalendarDay();
        const data = await postWaterLog(userToken, Math.round(amt), day);
        setConsumed(data.consumed ?? 0);
        setWaterGoalState(data.waterGoal ?? waterGoal);
        setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch (e) {
        console.error('postWaterLog:', e);
        await syncFromApi();
      }
      return;
    }

    setConsumed((prev) => Math.min(prev + Math.round(amt), waterGoal));
  };

  const removeWaterLog = async (logId) => {
    if (!userToken) return;
    try {
      const data = await deleteWaterLog(userToken, logId);
      setConsumed(data.consumed ?? 0);
      setWaterGoalState(data.waterGoal ?? waterGoal);
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (e) {
      console.error('deleteWaterLog:', e);
      await syncFromApi();
    }
  };

  const refreshWater = syncFromApi;

  const resetWater = () => setConsumed(0);

  return (
    <WaterContext.Provider value={{
      consumed,
      waterGoal,
      setWaterGoal,
      addWater,
      removeWaterLog,
      resetWater,
      logs,
      loading,
      refreshWater,
    }}>
      {children}
    </WaterContext.Provider>
  );
};

export const useWater = () => useContext(WaterContext);
