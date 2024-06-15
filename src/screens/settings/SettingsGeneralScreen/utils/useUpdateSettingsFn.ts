import { useAppSettings, useLibrarySettings } from '@hooks/persisted';
import { AppSettings, LibrarySettings } from '@hooks/persisted/useSettings';

type UpdateFunction<T extends keyof AppSettings | keyof LibrarySettings> = (
  value: unknown,
  key: keyof AppSettings | keyof LibrarySettings,
) => asserts key is T;

export default function useUpdateSettingsFn(settingOrigin: 'Library' | 'App') {
  const { setLibrarySettings } = useLibrarySettings();
  const { setAppSettings } = useAppSettings();
  if (settingOrigin === 'Library') {
    const update: UpdateFunction<keyof LibrarySettings> = (value, key) =>
      setLibrarySettings({
        [key]: value,
      });
    return update;
  } else {
    const update: UpdateFunction<keyof AppSettings> = (value, key) =>
      setAppSettings({
        [key]: value,
      });
    return update;
  }
}
