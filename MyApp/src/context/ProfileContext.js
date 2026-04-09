import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthProvider';   // 👈 import AuthContext
import { API_URL } from '../config';

const ProfileContext = createContext();

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  profileImage: null,
  coins: 0,
  goals: { dailyStep: 5000, weeklyStep: 15000 },
  settings: { notifications: true, theme: 'light', language: 'th' },
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const { userToken } = useContext(AuthContext); // 👈 เอา token มาใช้

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!userToken) {
          setLoading(false);
          return;
        }

        // 🔥 ดึงข้อมูลจาก backend
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (!res.ok) throw new Error('โหลดโปรไฟล์จาก API ไม่สำเร็จ');

        const data = await res.json();

        // เซ็ตค่า profile จาก backend
        setProfile({
          ...DEFAULT_PROFILE,
          ...data,
          goals:    { ...DEFAULT_PROFILE.goals,    ...data.goals    },
          settings: { ...DEFAULT_PROFILE.settings, ...data.settings },
        });

        // เก็บลง AsyncStorage ไว้ offline
        await AsyncStorage.setItem('PROFILE_DATA', JSON.stringify(data));

      } catch (e) {
        console.error('Load profile error:', e);

        // fallback → ใช้ข้อมูลจาก AsyncStorage ถ้า API fail
        const saved = await AsyncStorage.getItem('PROFILE_DATA');
        if (saved) setProfile(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userToken]); // 👈 รันใหม่ทุกครั้งที่ token เปลี่ยน

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('PROFILE_DATA', JSON.stringify(profile));
    }
  }, [profile, loading]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateGoals = (newGoals) => {
    setProfile(prev => ({ ...prev, goals: { ...prev.goals, ...newGoals } }));
  };

  const updateSettings = (newSettings) => {
    setProfile(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  };

  const logout = async (navigation) => {
    try {
      await AsyncStorage.removeItem('PROFILE_DATA');
      setProfile(DEFAULT_PROFILE);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      updateProfile,
      updateGoals,
      updateSettings,
      logout,
      loading,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
