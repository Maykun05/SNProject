import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homepage from '../screen/homepage';
import ExerciseScreen from '../screen/exercise';
import FeatureSelectionScreen from '../screen/FeatureSelectionScreen.js';
import CalScreen from '../screen/cal';
import WaterScreen from '../screen/WaterScreen.js';
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
      <Stack.Screen name="Select" component={FeatureSelectionScreen} />
      <Stack.Screen name="Calorie" component={CalScreen} />
      <Stack.Screen name="WaterScreen" component={WaterScreen} />


    </Stack.Navigator>
  );
}
