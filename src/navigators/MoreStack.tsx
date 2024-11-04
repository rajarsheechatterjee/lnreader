import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

// Screens
import About from '../screens/more/About';
import Settings from '../screens/settings/SettingsScreen';
import BackupSettings from '../screens/settings/SettingsBackupScreen';
import AdvancedSettings from '../screens/settings/SettingsAdvancedScreen';
import SettingsSubScreen from '../screens/settings/settingsScreens/SettingsSubScreen';
import TaskQueue from '../screens/more/TaskQueueScreen';
import Downloads from '../screens/more/DownloadsScreen';

import CategoriesScreen from '@screens/Categories/CategoriesScreen';
import StatsScreen from '@screens/StatsScreen/StatsScreen';
import { MoreStackParamList, SettingsStackParamList } from './types';
import ReaderSettingsSubScreen from '@screens/settings/settingsScreens/ReaderSettingsSubScreen';

const Stack = createStackNavigator<
  SettingsStackParamList & MoreStackParamList
>();

const stackNavigatorConfig = { headerShown: false };

const SettingsStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="SubScreen" component={SettingsSubScreen} />
    <Stack.Screen name="ReaderSettings" component={ReaderSettingsSubScreen} />
    <Stack.Screen name="BackupSettings" component={BackupSettings} />
    <Stack.Screen name="AdvancedSettings" component={AdvancedSettings} />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={stackNavigatorConfig}>
    <Stack.Screen name="SettingsStack" component={SettingsStack} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="TaskQueue" component={TaskQueue} />
    <Stack.Screen name="Downloads" component={Downloads} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="Statistics" component={StatsScreen} />
  </Stack.Navigator>
);

export default MoreStack;
