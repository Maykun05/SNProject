import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from '../screen/homepage';
import ExerciseScreen from '../screen/exercise';
import FeatureSelectionScreen from '../screen/FeatureSelectionScreen.js';
import FoodScreen from '../screen/CalorieScreen.js';
import WaterScreen from '../screen/WaterScreen.js';
import ProfileScreen from '../screen/ProfileScreen.js'; // ✅ เพิ่ม

import StepTrackerScreen from '../screen/StepTrackerScreen';

// ✅ Profile sub-screens
import EditGoalsScreen from '../screen/EditGoalsScreen.js';
import PrivacyPolicyScreen from '../screen/PrivacyPolicyScreen.js';
import NotificationsScreen from '../screen/NotificationsScreen.js';

import LoginScreen from '../screen/LoginScreen.js';
import GardenScreen from '../screen/GardenScreen.js';
const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={Homepage}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Calorie" component={FoodScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="WaterScreen"component={WaterScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="StepTracker" component={StepTrackerScreen} />

      {/* ✅ Profile ── */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="EditGoals"        component={EditGoalsScreen}  />
      <Stack.Screen name="PrivacyPolicy"    component={PrivacyPolicyScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Notifications"    component={NotificationsScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="GardenScreen"     component={GardenScreen} options={{ title: 'สวนของฉัน', headerShown: true }}/>

    </Stack.Navigator>
  );
}
