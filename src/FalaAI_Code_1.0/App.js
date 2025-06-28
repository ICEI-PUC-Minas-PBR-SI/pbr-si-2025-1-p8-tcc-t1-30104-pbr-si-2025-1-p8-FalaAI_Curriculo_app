import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screens/WelcomeScreen';
import RecordingScreen from './screens/RecordingScreen';
import DuvidasScreen from './screens/DuvidasScreen';
import PerfilScreen from './screens/PerfilScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Recording" component={RecordingScreen} />
        <Stack.Screen name="Duvidas" component={DuvidasScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
