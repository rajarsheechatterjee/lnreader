import {
  useAppSettings,
  useLastUpdate,
  useLibrarySettings,
} from '@hooks/persisted';
import { AppSettings, LibrarySettings } from '@hooks/persisted/useSettings';
import { SettingOrigin, ValueKey } from '@screens/settings/Settings';

type UpdateFunction<T extends ValueKey<SettingOrigin>> = (
  value: unknown,
  key: ValueKey<SettingOrigin>,
) => asserts key is T;

export default function useUpdateSettingsFn(settingOrigin: SettingOrigin) {
  const { setLibrarySettings } = useLibrarySettings();
  const { setAppSettings } = useAppSettings();
  const { setShowLastUpdateTime } = useLastUpdate();
  if (settingOrigin === 'Library') {
    const update: UpdateFunction<keyof LibrarySettings> = (value, key) =>
      setLibrarySettings({
        [key]: value,
      });
    return update;
  } else if (settingOrigin === 'App') {
    const update: UpdateFunction<keyof AppSettings> = (value, key) =>
      setAppSettings({
        [key]: value,
      });
    return update;
  } else if (settingOrigin === 'lastUpdateTime') {
    const update: UpdateFunction<'showLastUpdateTime'> = (value, key) =>
      setShowLastUpdateTime(value as boolean);
    return update;
  } else {
    throw new Error(
      'settingOrigin with the type of ' + settingOrigin + ' is not implemented',
    );
  }
}
