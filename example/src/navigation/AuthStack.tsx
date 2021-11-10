import LoginScreen from '../screens/LoginScreen';
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './index';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
