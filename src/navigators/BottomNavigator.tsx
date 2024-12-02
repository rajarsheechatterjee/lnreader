import React, { useMemo } from 'react';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';

import Library from '../screens/library/LibraryScreen';
import Updates from '../screens/updates/UpdatesScreen';
import History from '../screens/history/HistoryScreen';
import Browse from '../screens/browse/BrowseScreen';
import More from '../screens/more/MoreScreen';

import { getString } from '@strings/translations';
import { useAppSettings, usePlugins, useTheme } from '@hooks/persisted';
import { BottomNavigatorParamList } from './types';

const Tab = createMaterialBottomTabNavigator<BottomNavigatorParamList>();

const BottomNavigator = () => {
  const theme = useTheme();

  const {
    showHistoryTab = true,
    showUpdatesTab = true,
    showLabelsInNav = false,
  } = useAppSettings();

  const { filteredInstalledPlugins } = usePlugins();
  const pluginsWithUpdate = useMemo(
    () => filteredInstalledPlugins.filter(p => p.hasUpdate).length,
    [filteredInstalledPlugins],
  );

  return (
    <Tab.Navigator
      barStyle={{ backgroundColor: theme.surface2 }}
      theme={{ colors: theme }}
      activeColor={theme.onSecondaryContainer}
      shifting={!showLabelsInNav}
    >
      <Tab.Screen
        name="Library"
        component={Library}
        options={{
          title: getString('library'),
          tabBarIcon: 'bookmark-box-multiple',
        }}
      />
      {showUpdatesTab ? (
        <Tab.Screen
          name="Updates"
          component={Updates}
          options={{
            title: getString('updates'),
            tabBarIcon: 'alert-decagram-outline',
          }}
        />
      ) : null}
      {showHistoryTab ? (
        <Tab.Screen
          name="History"
          component={History}
          options={{
            title: getString('history'),
            tabBarIcon: 'history',
          }}
        />
      ) : null}
      <Tab.Screen
        name="Browse"
        component={Browse}
        options={{
          title: getString('browse'),
          tabBarIcon: 'compass-outline',
          tabBarBadge: pluginsWithUpdate
            ? pluginsWithUpdate.toString()
            : undefined,
        }}
      />
      <Tab.Screen
        name="More"
        component={More}
        options={{
          title: getString('more'),
          tabBarIcon: 'dots-horizontal',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;
