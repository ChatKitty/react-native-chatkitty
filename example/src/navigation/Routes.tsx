import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './index';
import { MainContext } from '../providers/MainProvider';
import * as React from 'react';
import { useContext } from 'react';
import HomeStack from './HomeStack';
import AuthStack from './AuthStack';

export default function Routes() {
  const { currentUser } = useContext(MainContext);

  return (
    <NavigationContainer ref={navigationRef}>
      {currentUser ? <HomeStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
