import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from '../screen/homepage';
import ExerciseScreen from '../screen/exercise';
import FeatureSelectScreen from '../screen/FeatureSelectScreen';
const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Homepage}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Exercise" component={ExerciseScreen} />
      <Stack.Screen name="Select" component={FeatureSelectScreen} />


    </Stack.Navigator>
  );
}
