import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Navigator from './src/navigation/stacknavigator'
import { NavigationContainer } from '@react-navigation/native';
import { ProfileProvider } from './src/context/ProfileContext';
export default function App() {
    return(
      <ProfileProvider>
        <NavigationContainer>
           <Navigator />
        </NavigationContainer>
      </ProfileProvider>
    );
}

