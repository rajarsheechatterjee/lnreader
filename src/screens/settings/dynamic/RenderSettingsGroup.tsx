import { List } from '@components';
import { SettingSubGroup } from '../Settings.d';
import { useTheme } from '@hooks/persisted';
import RenderSettings from './RenderSettings';

export default function ({
  setting,
  index,
}: {
  setting: SettingSubGroup<string>;
  index: number;
}) {
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
