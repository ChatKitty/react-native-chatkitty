import 'react-native-gesture-handler';
import * as React from 'react';
import Routes from './src/navigation/Routes';
import MainContextProvider from './src/providers/MainProvider';

export default function App() {
  return (
    <MainContextProvider>
      <Routes />
    </MainContextProvider>
  );
}
