import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './index';
import UsersScreen from '../screens/UsersScreen';
import CallScreen from '../screens/CallScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Users">
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
  );
}
