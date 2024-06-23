import { List } from '@components';
import { SettingSubGroup } from '../Settings';
import { useTheme } from '@hooks/persisted';
import RenderSettings from './RenderSettings';

export default function (setting: SettingSubGroup, index: number) {
  const theme = useTheme();

  return (
    <>
      {index === 0 ? null : <List.Divider theme={theme} />}
      <List.SubHeader key={'subHeader' + index} theme={theme}>
        {setting.subGroupTitle}
      </List.SubHeader>
      {setting.settings.map((settingOption, i) => {
        return (
          <RenderSettings setting={settingOption} key={'set' + index + i} />
        );
      })}
    </>
  );
}
