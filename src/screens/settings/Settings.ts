import { AppSettings, LibrarySettings } from '@hooks/persisted/useSettings';
import GeneralSettings from './settingsGroups/generalSettingsGroup';
import AppearanceSettings from './settingsGroups/appearanceSettingsGroup';
import { ThemeColors } from '@theme/types';

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

export type SettingsTypeModes = 'single' | 'multiple' | 'order';

export type ValueKey<T extends SettingOrigin> = T extends 'App'
  ? keyof AppSettings
  : T extends 'Library'
  ? keyof LibrarySettings
  : T extends 'lastUpdateTime'
  ? 'showLastUpdateTime'
  : T extends 'MMKV'
  ? 'isDark'
  : never;

export type SettingOrigin = 'App' | 'Library' | 'lastUpdateTime' | 'MMKV';

export type ModalSettingsType<T extends SettingOrigin> = {
  settingOrigin: T;
} & (
  | {
      mode: 'single';
      valueKey: ValueKey<T>;
      defaultValue: number;
      description?: (value: number) => string;
      options: Array<{
        label: string;
        value: number;
      }>;
    }
  | {
      mode: 'multiple';
      valueKey: Array<ValueKey<T>>;
      defaultValue: Array<boolean>;
      description?: (value: Array<boolean>) => string;
      options: Array<{
        label: string;
      }>;
    }
  | {
      mode: 'order';
      valueKey: ValueKey<T>;
      defaultValue: string;
      description?: (value: string) => string;

      options: Array<{
        label: string;
        ASC: string;
        DESC: string;
      }>;
    }
);

type BaseModalSetting = {
  title: string;
  type: 'Modal';
};
export type ModalSetting =
  | (BaseModalSetting & ModalSettingsType<'App'>)
  | (BaseModalSetting & ModalSettingsType<'Library'>);

export type SwitchSettingsType<T extends SettingOrigin> = {
  settingOrigin: T;
  valueKey: ValueKey<T>;
  defaultValue: boolean;
};

type BaseSwitchSetting = {
  title: string;
  description?: string;
  type: 'Switch';
};
export type SwitchSetting =
  | (BaseSwitchSetting & SwitchSettingsType<'App'>)
  | (BaseSwitchSetting & SwitchSettingsType<'lastUpdateTime'>)
  | (BaseSwitchSetting & SwitchSettingsType<'Library'>);

export type ThemePickerSetting = {
  title: string;
  type: 'ThemePicker';
  options: Array<ThemeColors>;
};

export type ColorPickerSettingsType<T extends SettingOrigin> = {
  settingOrigin: T;
  // valueKey: ValueKey<T>;
  // defaultValue: boolean;
};

type BaseColorPickerSetting = {
  title: string;
  description?: (val: string) => string;
  type: 'ColorPicker';
};
export type ColorPickerSetting =
  | BaseColorPickerSetting & ColorPickerSettingsType<'MMKV'>;

export interface SettingSubGroup {
  subGroupTitle: string;
  settings: Array<
    ModalSetting | SwitchSetting | ThemePickerSetting | ColorPickerSetting
  >;
}

export interface SettingsGroup {
  groupTitle: string;
  icon: string;
  navigateParam: settingsGroupTypes;
  subGroup: SettingSubGroup[];
}

interface Settings {
  general: SettingsGroup;
  appearance: SettingsGroup;
}

const settings: Settings = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
} as const;
export default settings;
