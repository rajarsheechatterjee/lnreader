import type {
  AppSettings,
  ChapterGeneralSettings,
  ChapterReaderSettings,
  LibrarySettings,
} from '@hooks/persisted/useSettings';
import type { ThemeColors } from '@theme/types';
import InfoItem from './dynamic/components/InfoItem';

type settingsGroupTypes =
  | 'GeneralSettings'
  | 'ReaderSettings'
  | 'TrackerSettings'
  | 'BackupSettings'
  | 'AppearanceSettings'
  | 'AdvancedSettings'
  | 'LibrarySettings'
  | 'RespositorySettings'
  | 'RepoSettings'
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

export type ReaderThemeSetting = { type: 'ReaderTheme' };
export type ReaderTTSSetting = { type: 'TTS' };
export type RepoSetting = { type: 'Repo' };
export type TrackerSetting = {
  type: 'Tracker';
  trackerName: 'AniList' | 'MyAnimeList';
};
export type InfoItem = { type: 'InfoItem'; title: string };

export type SettingsSubGroupSettings = { quickSettings?: boolean } & (
  | ModalSetting
  | SwitchSetting
  | ThemePickerSetting
  | ColorPickerSetting
  | NumberInputSetting
  | TextAreaSetting
  | ReaderThemeSetting
  | ReaderTTSSetting
  | RepoSetting
  | TrackerSetting
  | InfoItem
);

export interface SettingSubGroup<T extends string> {
  subGroupTitle: string;
  id: T;
  settings: Array<SettingsSubGroupSettings>;
}

export interface SettingsGroup<T extends string> {
  groupTitle: string;
  icon: string;
  navigateParam: settingsGroupTypes;
  subGroup: SettingSubGroup<T>[];
}

type generalIds =
  | 'display'
  | 'library'
  | 'novel'
  | 'globalUpdate'
  | 'autoDownload'
  | 'general';
type appearanceIds = 'appTheme' | 'novelInfo' | 'navbar';
type readerIds =
  | 'readerTheme'
  | 'customCSS'
  | 'customJS'
  | 'tts'
  | 'general'
  | 'autoScroll'
  | 'display';
type repoIds = '';
type trackerIds = 'services';
export interface Settings {
  general: SettingsGroup<generalIds>;
  appearance: SettingsGroup<appearanceIds>;
  reader: SettingsGroup<readerIds>;
  repo: SettingsGroup<repoIds>;
  tracker: SettingsGroup<trackerIds>;
}
