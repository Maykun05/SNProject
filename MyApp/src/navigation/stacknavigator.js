// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import LoginScreen from '../screen/login';
// import MoodScreen from '../screen/mental-feature'
// import DrinkScreen from '../screen/drink-feature';
// // import RegisterScreen from '../screens/RegisterScreen';
// import HomePage from '../screen/homepage';
// const Stack = createNativeStackNavigator();

// export default function StackNavigator() {
//   return (
//     <Stack.Navigator initialRouteName="Login">
//       <Stack.Screen
//         name="Login"
//         component={LoginScreen}
//         options={{ headerShown: false }} // ซ่อนหัวข้อบนหน้า Login
//       />
//       {/* <Stack.Screen
//         name="Register"
//         component={RegisterScreen}
//         options={{ title: 'สมัครสมาชิก' }}
//       /> */}
//       <Stack.Screen
//         name="Home"
//         component={HomePage}
//         options={{ title: 'homepage' }}
//       />
//       <Stack.Screen
//         name="Mental"
//         component={MoodScreen}
//         options={{ title: 'mood' }}
//       />
//        <Stack.Screen
//         name="Drink"
//         component={DrinkScreen}
//         options={{ title: 'drink' }}
//       />
//     </Stack.Navigator>
//   );
// }
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screen/login';
import BottomTabNavigator from './BottomTabNavigator';
import DrinkScreen from '../screen/drink-feature';
import MoodScreen from '../screen/mental-feature';
import ExerciseScreen from '../screen/exercise';

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
