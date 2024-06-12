import { AppSettings, LibrarySettings } from '@hooks/persisted/useSettings';
import { MoreStackParamList, SettingsStackParamList } from '@navigators/types';
import {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  displayModesList,
  gridSizeList,
} from '@screens/library/constants/constants';
import { getString } from '@strings/translations';
import React from 'react';

type settingsGroupTypes =
  | 'GeneralSettings'
  | 'ReaderSettings'
  | 'TrackerSettings'
  | 'BackupSettings'
  | 'AppearanceSettings'
  | 'AdvancedSettings'
  | 'LibrarySettings'
  | 'RespositorySettings'
  | undefined;

type ModalOptions = {
  label: string;
  value: string | number;
};

type SettingsTypeModes = 'single' | 'multiple' | 'order';

interface SettingsType<
  T extends keyof AppSettings | keyof LibrarySettings,
  V extends SettingsTypeModes,
> {
  type: 'Modal';
  mode: SettingsTypeModes;
  value: V extends 'multiple' ? T[] : T;
  options: ModalOptions[];
  //   value: T extends keyof AppSettings ? AppSettings[T] : T extends keyof LibrarySettings ? LibrarySettings[T] : never;
}

interface Setting {
  title: string;
  description?: string;

  settingsType: SettingsType<
    keyof AppSettings | keyof LibrarySettings,
    SettingsTypeModes
  >;
}

interface SettingSubGroup {
  subGroupTitle: string;
  settings: Setting[];
}

interface SettingsGroup {
  groupTitle: string;
  navigateParam: settingsGroupTypes;
  subGroup: SettingSubGroup[];
}

interface Settings {
  general: SettingsGroup;
}

const settings: Settings = {
  general: {
    groupTitle: getString('generalSettings'),
    navigateParam: 'GeneralSettings',
    subGroup: [
      {
        subGroupTitle: getString('common.display'),
        settings: [
          {
            title: getString('generalSettingsScreen.displayMode'),
            // description: () displayModesList[displayMode].label
            settingsType: {
              type: 'Modal',
              mode: 'single',
              value: 'displayMode',
              options: displayModesList,
              // value:
            },
          },
          {
            title: getString('generalSettingsScreen.itemsPerRowLibrary'),
            settingsType: {
              type: 'Modal',
              mode: 'single',
              value: 'novelsPerRow',
              options: gridSizeList,
              // value:
            },
          },
          {
            title: getString('generalSettingsScreen.novelBadges'),
            settingsType: {
              type: 'Modal',
              mode: 'multiple',
              value: [
                'showDownloadBadges',
                'showNumberOfNovels',
                'showUnreadBadges',
              ],
              options: gridSizeList,
              // value:
            },
          },
          {
            title: getString('generalSettingsScreen.novelSort'),
            settingsType: {
              type: 'Modal',
              mode: 'order',
              value: 'novelsPerRow',
              options: gridSizeList,
              // value:
            },
          },
        ],
      },
      {
        subGroupTitle: getString('common.display'),
        settings: [],
      },
    ],
  },
} as const;
export default settings;
