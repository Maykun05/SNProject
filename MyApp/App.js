import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Navigator from './src/navigation/stacknavigator'
import { NavigationContainer } from '@react-navigation/native';
export default function App() {
    return(
      <NavigationContainer>
         <Navigator />
      </NavigationContainer>
    );
}

