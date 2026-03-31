import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screen/LoginScreen.js';
import BottomTabNavigator from './BottomTabNavigator';
import RegisterScreen from '../screen/RegisterScreen.js';
import FeatureSelectionScreen from '../screen/FeatureSelectionScreen.js';
import PersonalInfoScreen from '../screen/PersonalInfoScreen.js';
const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Select" component={FeatureSelectionScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />

      {/* App */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
    </Stack.Navigator>
    // <Stack.Navigator initialRouteName="Login">
    //   <Stack.Screen
    //     name="Login"
    //     component={LoginScreen}
    //     options={{ headerShown: false }}
    //   />

    //   <Stack.Screen
    //     name="MainTabs"
    //     component={BottomTabNavigator}
    //     options={{ headerShown: false }}
    //   />
    // </Stack.Navigator>
  );
}
