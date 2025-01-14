import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import { enableFreeze } from 'react-native-screens';
import * as NavigationBar from 'expo-navigation-bar';

enableFreeze(true);

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import { createTables } from '@database/db';
import AppErrorBoundary from '@components/AppErrorBoundary/AppErrorBoundary';

import Main from './src/navigators/Main';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

createTables();
LottieSplashScreen.hide();

NavigationBar.setBehaviorAsync('overlay-swipe');
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <SafeAreaProvider>
          <PaperProvider>
            <BottomSheetModalProvider>
              <StatusBar translucent={true} backgroundColor="transparent" />
              <Main />
            </BottomSheetModalProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default App;
