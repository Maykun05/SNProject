import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '/Users/kuntidakongkad/Documents/ทำงานทำการ/SNProject/MyApp/src/screen/LoginScreen.js';
import BottomTabNavigator from './BottomTabNavigator';
const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>

  );
}
