import {
  AppSettings,
  ChapterGeneralSettings,
  ChapterReaderSettings,
  LibrarySettings,
} from '@hooks/persisted/useSettings';
import GeneralSettings from './settingsGroups/generalSettingsGroup';
import AppearanceSettings from './settingsGroups/appearanceSettingsGroup';
import { ThemeColors } from '@theme/types';
import ReaderSettings from './settingsGroups/readerSettingsGroup';

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
  : T extends 'GeneralChapter'
  ? keyof ChapterGeneralSettings
  : T extends 'ReaderChapter'
  ? keyof ChapterReaderSettings
  : never;

export type SettingOrigin =
  | 'App'
  | 'Library'
  | 'lastUpdateTime'
  | 'MMKV'
  | 'GeneralChapter'
  | 'ReaderChapter';

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
  dependents?: Array<SettingsSubGroupSettings>;
};

type BaseSwitchSetting = {
  title: string;
  description?: string;
  type: 'Switch';
};
export type SwitchSetting = BaseSwitchSetting &
  (
    | SwitchSettingsType<'App'>
    | SwitchSettingsType<'lastUpdateTime'>
    | SwitchSettingsType<'Library'>
    | SwitchSettingsType<'GeneralChapter'>
    | SwitchSettingsType<'ReaderChapter'>
  );

export type NumberInputSettingsType<T extends SettingOrigin> = {
  settingOrigin: T;
  valueKey: ValueKey<T>;
  defaultValue: string;
};

type BaseNumberInputSetting = {
  title: string;
  description?: string;
  type: 'NumberInput';
};
export type NumberInputSetting = BaseNumberInputSetting &
  (
    | NumberInputSettingsType<'App'>
    | NumberInputSettingsType<'lastUpdateTime'>
    | NumberInputSettingsType<'Library'>
    | NumberInputSettingsType<'GeneralChapter'>
    | NumberInputSettingsType<'ReaderChapter'>
  );

export type TextAreaSettingsType<T extends SettingOrigin> = {
  settingOrigin: T;
  valueKey: ValueKey<T>;
  defaultValue: string;
};

type BaseTextAreaSetting = {
  title: string;
  placeholder?: string;
  description?: string;
  openFileLabel: string;
  clearDialog: string;
  type: 'TextArea';
};
export type TextAreaSetting = BaseTextAreaSetting &
  (
    | TextAreaSettingsType<'App'>
    | TextAreaSettingsType<'lastUpdateTime'>
    | TextAreaSettingsType<'Library'>
    | TextAreaSettingsType<'GeneralChapter'>
    | TextAreaSettingsType<'ReaderChapter'>
  );

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

export type SettingsSubGroupSettings =
  | ModalSetting
  | SwitchSetting
  | ThemePickerSetting
  | ColorPickerSetting
  | NumberInputSetting
  | TextAreaSetting;

export interface SettingSubGroup {
  subGroupTitle: string;
  settings: Array<SettingsSubGroupSettings>;
}

export interface SettingsGroup {
  groupTitle: string;
  icon: string;
  navigateParam: settingsGroupTypes;
  subGroup: SettingSubGroup[];
}

export interface Settings {
  general: SettingsGroup;
  appearance: SettingsGroup;
  reader: SettingsGroup;
}

const settings: Settings = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  reader: ReaderSettings,
} as const;
export default settings;
