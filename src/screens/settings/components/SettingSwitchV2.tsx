import { SwitchItem } from '@components';
import { ThemeColors } from '@theme/types';
import useUpdateSettingsFn from '../SettingsGeneralScreen/utils/useUpdateSettingsFn';
import { SwitchSetting } from '../Settings';
import { useAppSettings, useLibrarySettings } from '@hooks/persisted';
import { useMemo } from 'react';

interface SettingSwitchProps {
  setting: SwitchSetting;
  theme: ThemeColors;
}

export default function SettingSwitchV2({
  setting,
  theme,
}: SettingSwitchProps) {
  const update = useUpdateSettingsFn(setting.settingOrigin);
  const { setLibrarySettings, ...librarySettings } = useLibrarySettings();
  const { setAppSettings, ...appSettings } = useAppSettings();
  const currentValue = useMemo(() => {
    let res;
    if (setting.settingOrigin === 'Library') {
      res = librarySettings[setting.valueKey] ?? setting.defaultValue;
    } else {
      res = appSettings[setting.valueKey] ?? setting.defaultValue;
    }
    return res as boolean;
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
