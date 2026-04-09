import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthProvider';

import LoginScreen from '../screen/LoginScreen.js';
import BottomTabNavigator from './BottomTabNavigator';
import RegisterScreen from '../screen/RegisterScreen.js';
import FeatureSelectionScreen from '../screen/FeatureSelectionScreen.js';
import PersonalInfoScreen from '../screen/PersonalInfoScreen.js';
import StepTrackerScreen from '../screen/StepTrackerScreen.js';

import CalorieScreen from '../screen/CalorieScreen';
const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { userToken, isRegisterFlow } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        isRegisterFlow ? (
          <>
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="Select" component={FeatureSelectionScreen} />
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="StepTracker" component={StepTrackerScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="StepTracker" component={StepTrackerScreen} />
            <Stack.Screen name="CalorieScreen" component={CalorieScreen} />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}


