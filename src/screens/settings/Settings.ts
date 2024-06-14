import { AppSettings, LibrarySettings } from '@hooks/persisted/useSettings';
import { MoreStackParamList, SettingsStackParamList } from '@navigators/types';
import {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  DisplayModes,
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
  value: number;
};

export type SettingsTypeModes = 'single' | 'multiple' | 'order';

export type SettingsType<T extends keyof AppSettings | keyof LibrarySettings> =
  | {
      mode: 'single' | 'order';
      valueKey: T;
      defaultValue: number | boolean;
      options: ModalOptions[];
      //   value: T extends keyof AppSettings ? AppSettings[T] : T extends keyof LibrarySettings ? LibrarySettings[T] : never;
    }
  | {
      mode: 'multiple';
      valueKey: T[];
      defaultValue: Array<number | boolean>;
      options: ModalOptions[];
      //   value: T extends keyof AppSettings ? AppSettings[T] : T extends keyof LibrarySettings ? LibrarySettings[T] : never;
    };

type BaseModalSetting = {
  title: string;
  description?: string;
  type: 'Modal';
};
export type ModalSetting =
  | (BaseModalSetting & { settingOrigin: 'App' } & SettingsType<
        keyof AppSettings
      >)
  | (BaseModalSetting & { settingOrigin: 'Library' } & SettingsType<
        keyof LibrarySettings
      >);

interface SettingSubGroup {
  subGroupTitle: string;
  settings: ModalSetting[];
}

interface SettingsGroup {
  groupTitle: string;
  icon: string;
  navigateParam: settingsGroupTypes;
  subGroup: SettingSubGroup[];
}

interface Settings {
  general: SettingsGroup;
}

const settings: Settings = {
  general: {
    groupTitle: getString('generalSettings'),
    icon: 'tune',
    navigateParam: 'GeneralSettings',
    subGroup: [
      {
        subGroupTitle: getString('common.display'),
        settings: [
          {
            title: getString('generalSettingsScreen.displayMode'),
            // description: () displayModesList[displayMode].label
            type: 'Modal',
            settingOrigin: 'Library',

            mode: 'single',
            valueKey: 'displayMode',
            defaultValue: DisplayModes.Comfortable,
            options: displayModesList,
            // valueKey:
          },
          {
            title: getString('generalSettingsScreen.itemsPerRowLibrary'),
            type: 'Modal',
            settingOrigin: 'Library',

            mode: 'single',
            valueKey: 'novelsPerRow',
            defaultValue: 3,
            options: gridSizeList,
            // valueKey:
          },
          {
            title: getString('generalSettingsScreen.novelBadges'),
            type: 'Modal',
            settingOrigin: 'Library',

            mode: 'multiple',
            valueKey: [
              'showDownloadBadges',
              'showNumberOfNovels',
              'showUnreadBadges',
            ],
            defaultValue: [true, false, true],
            options: gridSizeList,
            // valueKey:
          },
          {
            title: getString('generalSettingsScreen.novelSort'),
            type: 'Modal',
            settingOrigin: 'Library',

            mode: 'order',
            valueKey: 'novelsPerRow',
            defaultValue: 3,
            options: gridSizeList,
            // value:
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
