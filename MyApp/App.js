import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import PersonalInfoScreen from './src/screen/PersonalInfoScreen';
import MainScreen from './src/screen/MainScreen';
import WaterScreen from './src/screen/WaterScreen';

// --- 1. เพิ่มการ Import หน้า Profile ตรงนี้ ---
import ProfileScreen from './src/screen/ProfileScreen'; 
import FeatureSelectionScreen from './src/screen/FeatureSelectionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Water" component={WaterScreen} />
        <Stack.Screen name="FeatureSelection" component={FeatureSelectionScreen} />
        
        {/* --- 2. เพิ่ม Stack Screen สำหรับ Profile ตรงนี้ --- */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}