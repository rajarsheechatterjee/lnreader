import { getString } from '@strings/translations';
import { appearanceIds, SettingsGroup } from '../Settings.d';
import { darkThemes, lightThemes } from '@theme/md3';

const AppearanceSettings: SettingsGroup<appearanceIds> = {
  groupTitle: getString('appearance'),
  icon: 'palette-outline',
  navigateParam: 'AppearanceSettings',
  subGroup: [
    {
      subGroupTitle: getString('appearanceScreen.appTheme'),
      id: 'appTheme',
      settings: [
        {
          title: getString('appearanceScreen.lightTheme'),
          type: 'ThemePicker',
          options: lightThemes,
        },
        {
          title: getString('appearanceScreen.darkTheme'),
          type: 'ThemePicker',
          options: darkThemes,
        },
        {
          type: 'ColorPicker',
          title: getString('appearanceScreen.accentColor'),
          description: c => c.toUpperCase() ?? '',
          settingOrigin: 'MMKV',
        },
      ],
    },
    {
      subGroupTitle: getString('appearanceScreen.novelInfo'),
      id: 'novelInfo',
      settings: [
        {
          title: getString('appearanceScreen.hideBackdrop'),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'hideBackdrop',
          defaultValue: false,
        },
        {
          title: getString('advancedSettingsScreen.useFAB'),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'useFabForContinueReading',
          defaultValue: false,
        },
      ],
    },
    {
      subGroupTitle: getString('appearanceScreen.navbar'),
      id: 'navbar',
      settings: [
        {
          title: getString('appearanceScreen.showUpdatesInTheNav'),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'showUpdatesTab',
          defaultValue: true,
        },
        {
          title: getString('appearanceScreen.showHistoryInTheNav'),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'showHistoryTab',
          defaultValue: true,
        },
        {
          title: getString('appearanceScreen.alwaysShowNavLabels'),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'showLabelsInNav',
          defaultValue: true,
        },
      ],
    },
  ],
};
export default AppearanceSettings;
