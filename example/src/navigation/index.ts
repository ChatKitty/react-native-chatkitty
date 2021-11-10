import {NavigationContainerRef} from '@react-navigation/native';
import React from 'react';

export type Routes = 'Login' | 'Users' | 'Call';

export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  Users: undefined;
  Call: undefined;
};

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function navigate(name: Routes, params?: any) {
  navigationRef.current?.navigate(name, params);
}
