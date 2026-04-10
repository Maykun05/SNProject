// src/context/GardenContext.js

import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const GardenContext = createContext(null);

const API_BASE = `${API_URL}/api`;

const parseApiResponse = async (res, endpointName) => {
  const raw = await res.text();
  let json = null;

  try {
    json = raw ? JSON.parse(raw) : {};
  } catch (parseErr) {
    const contentType = res.headers?.get?.('content-type') || 'unknown';
    const snippet = raw ? raw.slice(0, 160).replace(/\s+/g, ' ') : '(empty body)';
    throw new Error(
      `[${endpointName}] Invalid JSON response (${res.status}) content-type=${contentType}, body="${snippet}"`
    );
  }

  if (!res.ok) {
    const message = json?.message || `${endpointName} failed with status ${res.status}`;
    throw new Error(message);
  }

  return json;
};

export const GardenProvider = ({ children }) => {
  const [gardenData, setGardenData]       = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);
  const [summary, setSummary]             = useState([]);
  const [loading, setLoading]             = useState(false);

  const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  // ดึงสวนรายเดือน
  const fetchGardenMonth = useCallback(async (year, month) => {
    const headers = await getAuthHeader();
    if (!headers) return null;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/daily-progress/month?year=${year}&month=${month}`, { headers });
      const json = await parseApiResponse(res, 'fetchGardenMonth');
      if (json.success) setGardenData(json.data);
      return json.data;
    } catch (err) {
      console.error('fetchGardenMonth:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึง progress วันนี้
  const fetchTodayProgress = useCallback(async () => {
    const headers = await getAuthHeader();
    if (!headers) return null;
    try {
      const res = await fetch(`${API_BASE}/daily-progress/today`, { headers });
      const json = await parseApiResponse(res, 'fetchTodayProgress');
      if (json.success) setTodayProgress(json.data);
      return json.data;
    } catch (err) {
      console.error('fetchTodayProgress:', err);
    }
  }, []);

  // ดึงสรุปทุกเดือน
  const fetchSummary = useCallback(async () => {
    const headers = await getAuthHeader();
    if (!headers) return null;
    try {
      const res = await fetch(`${API_BASE}/daily-progress/summary`, { headers });
      const json = await parseApiResponse(res, 'fetchSummary');
      if (json.success) setSummary(json.data.months);
      return json.data.months;
    } catch (err) {
      console.error('fetchSummary:', err);
    }
  }, []);

  // บันทึก feature ที่ใช้ และคืน { treeGrown, treeCount }
  const logFeature = useCallback(async (featureKey) => {
    const headers = await getAuthHeader();
    if (!headers) return null;
    try {
      const res = await fetch(`${API_BASE}/daily-progress/log`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ featureKey }),
      });
      const json = await parseApiResponse(res, 'logFeature');
      if (json.success) {
        // อัพเดท today progress
        setTodayProgress(prev => ({
          ...prev,
          completedFeatures: json.data.completedToday,
          completedCount: json.data.targetFeatures.filter(k =>
            json.data.completedToday.includes(k)
          ).length,
          treeEarnedToday: json.data.treeGrown || prev?.treeEarnedToday,
        }));

        // อัพเดท treeCount ใน gardenData ถ้ามีต้นไม้งอกใหม่
        if (json.data.treeGrown) {
          setGardenData(prev =>
            prev ? { ...prev, treeCount: json.data.treeCount } : prev
          );
        }
      }
      return json.data;
    } catch (err) {
      console.error('logFeature:', err);
    }
  }, []);

  // เลือก features เป้าหมาย
  const selectFeatures = useCallback(async (featureKeys) => {
    const headers = await getAuthHeader();
    if (!headers) return null;
    try {
      const res = await fetch(`${API_BASE}/daily-progress/features/select`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ featureKeys }),
      });
      const json = await parseApiResponse(res, 'selectFeatures');
      return json;
    } catch (err) {
      console.error('selectFeatures:', err);
    }
  }, []);

  return (
    <GardenContext.Provider value={{
      gardenData,
      todayProgress,
      summary,
      loading,
      fetchGardenMonth,
      fetchTodayProgress,
      fetchSummary,
      logFeature,
      selectFeatures,
    }}>
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error('useGarden must be used within GardenProvider');
  return ctx;
};