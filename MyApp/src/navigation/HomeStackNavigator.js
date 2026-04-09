import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import Homepage from '../screen/homepage';
import ExerciseScreen from '../screen/exercise';
import FeatureSelectionScreen from '../screen/FeatureSelectionScreen.js';
import CalScreen from '../screen/cal';
import WaterScreen from '../screen/WaterScreen.js';
import ProfileScreen from '../screen/ProfileScreen.js';
import StepTrackerScreen from '../screen/StepTrackerScreen';
import EditPersonalInfoScreen from '../screen/EditPersonalInfoScreen.js';
import EditGoalsScreen from '../screen/EditGoalsScreen.js';
import PrivacyPolicyScreen from '../screen/PrivacyPolicyScreen.js';
import NotificationsScreen from '../screen/NotificationsScreen.js';
import LoginScreen from '../screen/LoginScreen.js';
import GardenScreen from '../screen/GardenScreen.js';

const Stack = createNativeStackNavigator();

// ✅ Redirect component — เมื่อ navigate('Calorie') จาก Stack
// จะ redirect ไปที่ Tab 'Calorie' แทน แล้ว Bottom Tab จะแสดงปกติ
function CalorieRedirect() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.getParent()?.navigate('Calorie');
  }, []);
  return null;
}

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Homepage}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Exercise"     component={ExerciseScreen} />
      {/* ✅ ใช้ CalorieRedirect แทน CalScreen เพื่อให้ Bottom Tab แสดง */}
      <Stack.Screen
        name="Calorie"
        component={CalorieRedirect}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="WaterScreen"  component={WaterScreen} />
      <Stack.Screen name="Login"        component={LoginScreen} />
      <Stack.Screen name="StepTracker"  component={StepTrackerScreen} />

      {/* ✅ Profile ── */}
      <Stack.Screen name="Profile"          component={ProfileScreen} />
      <Stack.Screen name="EditPersonalInfo" component={EditPersonalInfoScreen} />
      <Stack.Screen name="EditGoals"        component={EditGoalsScreen} />
      <Stack.Screen name="PrivacyPolicy"    component={PrivacyPolicyScreen} />
      <Stack.Screen name="Notifications"    component={NotificationsScreen} />

      <Stack.Screen
        name="GardenScreen"
        component={GardenScreen}
        options={{ title: 'สวนของฉัน', headerShown: true }}
      />
    </Stack.Navigator>
  );
}