import { AuthProvider } from './src/context/AuthProvider';
import Navigator from './src/navigation/stacknavigator'
import { NavigationContainer } from '@react-navigation/native';
export default function App() {
  return(
    <AuthProvider>
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

