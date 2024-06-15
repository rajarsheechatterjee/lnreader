import { SwitchItem } from '@components';
import { ThemeColors } from '@theme/types';
import useUpdateSettingsFn from '../SettingsGeneralScreen/utils/useUpdateSettingsFn';
import { SwitchSetting } from '../Settings';
import {
  useAppSettings,
  useLastUpdate,
  useLibrarySettings,
} from '@hooks/persisted';
import { useMemo } from 'react';

interface SettingSwitchProps {
  setting: SwitchSetting;
  theme: ThemeColors;
}

export default function SettingSwitchV2({
  setting,
  theme,
}: SettingSwitchProps) {
  const update = useUpdateSettingsFn(setting.settingOrigin)!;
  const { setLibrarySettings, ...librarySettings } = useLibrarySettings();
  const { setAppSettings, ...appSettings } = useAppSettings();
  const { showLastUpdateTime } = useLastUpdate();

  const currentValue = useMemo(() => {
    let res;
    if (setting.settingOrigin === 'Library') {
      res = librarySettings[setting.valueKey];
    } else if (setting.settingOrigin === 'App') {
      res = appSettings[setting.valueKey];
    } else if (setting.settingOrigin === 'lastUpdateTime') {
      res = showLastUpdateTime;
    }
    return (res ?? setting.defaultValue) as boolean;
  }, [librarySettings, appSettings]);

  return (
    <SwitchItem
      value={currentValue}
      label={setting.title}
      description={setting.description}
      onPress={() => update(!currentValue, setting.valueKey)}
      theme={theme}
      style={{ paddingHorizontal: 16 }}
    />
  );
}
