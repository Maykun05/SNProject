import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from '../screen/homepage';
import ExerciseScreen from '../screen/exercise';
import CalScreen from '../screen/cal';
import WaterScreen from '../screen/WaterScreen.js';
import ProfileScreen from '../screen/ProfileScreen.js'; // ✅ เพิ่ม

// ✅ Profile sub-screens
import EditPersonalInfoScreen from '../screen/EditPersonalInfoScreen.js';
import EditGoalsScreen from '../screen/EditGoalsScreen.js';
import PrivacyPolicyScreen from '../screen/PrivacyPolicyScreen.js';
import NotificationsScreen from '../screen/NotificationsScreen.js';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* ── Home ── */}
      <Stack.Screen name="Home"       component={Homepage} />
      <Stack.Screen name="Exercise"   component={ExerciseScreen} />
      <Stack.Screen name="Calorie"    component={CalScreen} />
      <Stack.Screen name="WaterScreen" component={WaterScreen} />

      {/* ✅ Profile ── */}
      <Stack.Screen name="Profile"          component={ProfileScreen} />
      <Stack.Screen name="EditPersonalInfo" component={EditPersonalInfoScreen} />
      <Stack.Screen name="EditGoals"        component={EditGoalsScreen} />
      <Stack.Screen name="PrivacyPolicy"    component={PrivacyPolicyScreen} />
      <Stack.Screen name="Notifications"    component={NotificationsScreen} />

    </Stack.Navigator>
  );
}