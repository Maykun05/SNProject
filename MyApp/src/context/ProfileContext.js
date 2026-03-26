import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileContext = createContext();

const DEFAULT_PROFILE = {
  name: 'Maykun', // ชื่อเริ่มต้นตาม UI
  email: 'example@email.com',
  phone: '08X-XXX-XXXX',
  profileImage: null,
  coins: 3,
  // เพิ่มส่วนของเป้าหมายตาม UI
  goals: {
    dailyStep: 5000,
    weeklyStep: 15000,
  },
  settings: {
    notifications: true,
    theme: 'light',
    language: 'th',
  },
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem('PROFILE_DATA');
        if (saved) {
          // ผสมข้อมูลเก่ากับโครงสร้างใหม่ เพื่อป้องกัน error กรณีเพิ่มฟิลด์ใหม่
          const parsed = JSON.parse(saved);
          setProfile({ ...DEFAULT_PROFILE, ...parsed });
        }
      } catch (e) {
        console.error('Load profile error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // บันทึกข้อมูลเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('PROFILE_DATA', JSON.stringify(profile));
    }
  }, [profile, loading]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateGoals = (newGoals) => {
    setProfile(prev => ({
      ...prev,
      goals: { ...prev.goals, ...newGoals }
    }));
  };

  const updateSettings = (newSettings) => {
    setProfile(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('PROFILE_DATA'); // ลบเฉพาะข้อมูลโปรไฟล์
      setProfile(DEFAULT_PROFILE);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, updateGoals, logout, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);