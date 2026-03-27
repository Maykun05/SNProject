import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ✅ ลบ useNavigation ออก

const ProfileContext = createContext();

const DEFAULT_PROFILE = {
  name: 'ธนาพล เจริญสุข',
  email: 'example@email.com',
  phone: '08X-XXX-XXXX',
  profileImage: null,
  coins: 3,
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
          const parsed = JSON.parse(saved);
          setProfile({
            ...DEFAULT_PROFILE,
            ...parsed,
            goals:    { ...DEFAULT_PROFILE.goals,    ...parsed.goals    },
            settings: { ...DEFAULT_PROFILE.settings, ...parsed.settings },
          });
        }
      } catch (e) {
        console.error('Load profile error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

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
      goals: { ...prev.goals, ...newGoals },
    }));
  };

  const updateSettings = (newSettings) => {
    setProfile(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  // ✅ รับ navigation เป็น parameter แทน
  const logout = async (navigation) => {
    try {
      await AsyncStorage.removeItem('PROFILE_DATA');
      setProfile(DEFAULT_PROFILE);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
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