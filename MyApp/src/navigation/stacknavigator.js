import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthProvider';

import LoginScreen from '../screen/LoginScreen.js';
import BottomTabNavigator from './BottomTabNavigator';
import RegisterScreen from '../screen/RegisterScreen.js';
import FeatureSelectionScreen from '../screen/FeatureSelectionScreen.js';
import PersonalInfoScreen from '../screen/PersonalInfoScreen.js';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { userToken } = useContext(AuthContext);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        // ถ้า login แล้ว
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Select" component={FeatureSelectionScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        </>
      ) : (
        // ถ้ายังไม่ login
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
