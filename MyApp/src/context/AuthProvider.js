import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userId, setUserId] = useState(null);

  // โหลด token + userId จาก AsyncStorage ตอนเปิดแอป
  useEffect(() => {
    const loadAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      const id = await AsyncStorage.getItem('userId');
      if (token) setUserToken(token);
      if (id) setUserId(id);
    };
    loadAuth();
  }, []);

  // login → เก็บ token + userId ลง AsyncStorage และอัปเดต state
  const login = async (token, id) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userId', id.toString());
    setUserToken(token);
    setUserId(id);
  };

  // logout → ลบข้อมูลออก
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    setUserToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
