import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './src/navigation/stacknavigator';
import { ProfileProvider } from './src/context/ProfileContext';
import { WaterProvider }   from './src/context/WaterContext';
import { StepProvider }    from './src/context/StepContext';
import { LevelProvider }   from './src/context/LevelContext'; // ✅ เพิ่ม

export default function App() {
  return (
    <ProfileProvider>
      <WaterProvider>
        <StepProvider>
          <LevelProvider> 
            <NavigationContainer>
              <Navigator />
            </NavigationContainer>
          </LevelProvider>
        </StepProvider>
      </WaterProvider>
    </ProfileProvider>
  );
}