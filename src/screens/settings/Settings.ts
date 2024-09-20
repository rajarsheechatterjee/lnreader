import GeneralSettings from './settingsGroups/generalSettingsGroup';
import AppearanceSettings from './settingsGroups/appearanceSettingsGroup';
import ReaderSettings from './settingsGroups/readerSettingsGroup';
import RepoSettings from './settingsGroups/repoSettingsGroup';
import type { Settings } from './Settings.d';

const settings: Settings = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  reader: ReaderSettings,
  repo: RepoSettings,
} as const;
export default settings;
