import { List } from '@components';
import { SettingSubGroup } from '../Settings';
import DefaultSettingModal from '../SettingsGeneralScreen/modals/DefaultSettingModal';
import SettingSwitchV2 from './SettingSwitchV2';
import { useTheme } from '@hooks/persisted';
import SettingsThemePicker from './SettingsThemePicker';
import ColorPickerModal from '../SettingsGeneralScreen/modals/ColorPickerModal';

export default function (setting: SettingSubGroup, index: number) {
  const theme = useTheme();

  return (
    <>
      {index === 0 ? null : <List.Divider theme={theme} />}
      <List.SubHeader key={'subHeader' + index} theme={theme}>
        {setting.subGroupTitle}
      </List.SubHeader>
      {setting.settings.map((settingOption, i) => {
        switch (settingOption.type) {
          case 'Modal':
            return (
              <DefaultSettingModal
                key={'settingOption' + index + i}
                setting={settingOption}
                theme={theme}
              />
            );
          case 'Switch':
            return (
              <SettingSwitchV2
                key={'settingOption' + index + i}
                setting={settingOption}
                theme={theme}
              />
            );
          case 'ThemePicker':
            return (
              <SettingsThemePicker
                settings={settingOption}
                theme={theme}
                key={'settingOption' + index + i}
              />
            );
          case 'ColorPicker':
            return (
              <ColorPickerModal
                settings={settingOption}
                theme={theme}
                showAccentColors
                key={'settingOption' + index + i}
              />
            );
        }
      })}
    </>
  );
}
