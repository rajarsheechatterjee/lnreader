import { List } from '@components';
import { SettingSubGroup } from '../Settings';
import DefaultSettingModal from '../SettingsGeneralScreen/modals/DefaultSettingModal';
import SettingSwitchV2 from './SettingSwitchV2';
import { useTheme } from '@hooks/persisted';

export default function (setting: SettingSubGroup, index: number) {
  const theme = useTheme();

  return (
    <>
      {index === 0 ? null : <List.Divider theme={theme} />}
      <List.SubHeader key={'subHeader' + index} theme={theme}>
        {setting.subGroupTitle}
      </List.SubHeader>
      {setting.settings.map((settingOption, i) => {
        if (settingOption.type === 'Modal') {
          return (
            <DefaultSettingModal
              key={'settingOption' + index + i}
              setting={settingOption}
              theme={theme}
            />
          );
        } else if (settingOption.type === 'Switch') {
          return (
            <SettingSwitchV2
              key={'settingOption' + index + i}
              setting={settingOption}
              theme={theme}
            />
          );
        }
      })}
    </>
  );
}
