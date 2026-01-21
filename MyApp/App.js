import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 1. แก้ไขการ Import ให้เป็น Relative Path ทั้งหมดเพื่อความเสถียร
import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import PersonalInfoScreen from './src/screen/PersonalInfoScreen';
import MainScreen from './src/screen/MainScreen';
import WaterScreen from './src/screen/WaterScreen';

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
        {/* 2. เมื่อ Import ด้านบนแล้ว บรรทัดนี้จะทำงานได้ปกติ */}
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Water" component={WaterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}