import { AuthProvider } from './src/context/AuthProvider';
import Navigator from './src/navigation/stacknavigator'
import { NavigationContainer } from '@react-navigation/native';
import { ProfileProvider } from './src/context/ProfileContext';
import { WaterProvider }   from './src/context/WaterContext';
import { StepProvider }    from './src/context/StepContext';
import { LevelProvider }   from './src/context/LevelContext'; 
import { GardenProvider } from './src/context/GardenContext';

export default function App() {
  return (
    <AuthProvider>
      <GardenProvider> 
        <ProfileProvider>
          <WaterProvider>
            <StepProvider>
              <LevelProvider> {/* ✅ เพิ่ม */}
                <NavigationContainer>
                  <Navigator />
                </NavigationContainer>
              </LevelProvider>
            </StepProvider>
          </WaterProvider>
        </ProfileProvider>
      </GardenProvider> 
    </AuthProvider>
  );
}

