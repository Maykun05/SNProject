import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthProvider';

import LoginScreen from '../screen/LoginScreen.js';
import BottomTabNavigator from './BottomTabNavigator';
import RegisterScreen from '../screen/RegisterScreen.js';
import ForgotPasswordScreen from '../screen/ForgotPasswordScreen.js';
import FeatureSelectionScreen from '../screen/FeatureSelectionScreen.js';
import PersonalInfoScreen from '../screen/PersonalInfoScreen.js';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { userToken, isRegisterFlow } = useContext(AuthContext);
  const screens = userToken
    ? isRegisterFlow
      ? [
          <Stack.Screen key="PersonalInfo" name="PersonalInfo" component={PersonalInfoScreen} />,
          <Stack.Screen key="Select" name="Select" component={FeatureSelectionScreen} />,
          <Stack.Screen key="MainTabs" name="MainTabs" component={BottomTabNavigator} />,
        ]
      : [
          <Stack.Screen key="MainTabs" name="MainTabs" component={BottomTabNavigator} />,
        ]
    : [
        <Stack.Screen key="Login" name="Login" component={LoginScreen} />,
        <Stack.Screen key="Register" name="Register" component={RegisterScreen} />,
        <Stack.Screen key="ForgotPassword" name="ForgotPassword" component={ForgotPasswordScreen} />,
      ];

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {screens}
    </Stack.Navigator>
  );
}


