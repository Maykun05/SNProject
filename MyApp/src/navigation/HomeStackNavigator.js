import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Homepage from '../screen/homepage';
import DrinkScreen from '../screen/drink-feature';
import MoodScreen from '../screen/mental-feature';
import ExerciseScreen from '../screen/exercise';
const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Homepage}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Water" component={DrinkScreen} />
      <Stack.Screen name="Mood" component={MoodScreen} />
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
    </Stack.Navigator>
  );
}
