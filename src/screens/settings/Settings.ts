import { AppSettings, LibrarySettings } from '@hooks/persisted/useSettings';
import GeneralSettings from './settingsGroups/generalSettingsGroup';

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

type ValueKey<T extends SettingOrigin> = T extends 'App'
  ? keyof AppSettings
  : keyof LibrarySettings;

type SettingOrigin = 'App' | 'Library';

export type ModalSettingsType<T extends SettingOrigin> = {
  settingOrigin: T;
} & (
  | {
      mode: 'single';
      valueKey: ValueKey<T>;
      defaultValue: number;
      options: Array<{
        label: string;
        value: number;
      }>;
    }
  | {
      mode: 'multiple';
      valueKey: Array<ValueKey<T>>;
      defaultValue: Array<boolean>;
      options: Array<{
        label: string;
      }>;
    }
  | {
      mode: 'order';
      valueKey: ValueKey<T>;
      defaultValue: string;
      options: Array<{
        label: string;
        ASC: string;
        DESC: string;
      }>;
    }
);

type BaseModalSetting = {
  title: string;
  description?: string;
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
  | (BaseSwitchSetting & SwitchSettingsType<'Library'>);

interface SettingSubGroup {
  subGroupTitle: string;
  settings: Array<ModalSetting | SwitchSetting>;
}

export interface SettingsGroup {
  groupTitle: string;
  icon: string;
  navigateParam: settingsGroupTypes;
  subGroup: SettingSubGroup[];
}

interface Settings {
  general: SettingsGroup;
}

const settings: Settings = {
  general: GeneralSettings,
} as const;
export default settings;
