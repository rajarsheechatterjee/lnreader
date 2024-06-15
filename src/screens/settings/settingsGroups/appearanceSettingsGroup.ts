import { getString } from '@strings/translations';
import { SettingsGroup } from '../Settings';
import { darkThemes, lightThemes } from '@theme/md3';

const AppearanceSettings: SettingsGroup = {
  groupTitle: getString('appearance'),
  icon: 'palette-outline',
  navigateParam: 'AppearanceSettings',
  subGroup: [
    {
      subGroupTitle: getString('appearanceScreen.appTheme'),
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
  ],
};
export default AppearanceSettings;
