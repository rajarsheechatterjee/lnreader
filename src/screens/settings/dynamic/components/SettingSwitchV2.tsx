import { SwitchItem } from '@components';
import { ThemeColors } from '@theme/types';
import useUpdateSettingsFn from '../functions/useUpdateSettingsFn';
import { SettingOrigin, SwitchSetting, ValueKey } from '../../Settings.d';
import {
  useAppSettings,
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useLastUpdate,
  useLibrarySettings,
} from '@hooks/persisted';
import { useMemo } from 'react';
import RenderSettings from '../RenderSettings';
import Animated, {
  Easing,
  ReduceMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface SettingSwitchProps {
  setting: SwitchSetting;
  theme: ThemeColors;
  quickSettings?: boolean;
  endOfLine?: () => React.ReactNode;
}

export default function containerSettingSwitchV2({
  setting,
  theme,
  quickSettings,
  endOfLine,
}: SettingSwitchProps) {
  const up = useUpdateSettingsFn(setting.settingOrigin)!;

  const librarySettings = useLibrarySettings();
  const appSettings = useAppSettings();
  const chapterSettings = useChapterGeneralSettings();
  const chapterReaderSettings = useChapterReaderSettings();
  const { showLastUpdateTime } = useLastUpdate();

  const currentValue = useMemo(() => {
    let res;
    if (setting.settingOrigin === 'Library') {
      res = librarySettings[setting.valueKey];
    } else if (setting.settingOrigin === 'App') {
      res = appSettings[setting.valueKey];
    } else if (setting.settingOrigin === 'lastUpdateTime') {
      res = showLastUpdateTime;
    } else if (setting.settingOrigin === 'GeneralChapter') {
      res = chapterSettings[setting.valueKey];
    } else if (setting.settingOrigin === 'ReaderChapter') {
      res = chapterReaderSettings[setting.valueKey];
    }
    return (res ?? setting.defaultValue) as boolean;
  }, [librarySettings, appSettings, showLastUpdateTime, chapterSettings]);

  const dependents = useMemo(() => {
    return setting.dependents?.filter(d => {
      quickSettings ? d.quickSettings : true;
    });
  }, [setting.dependents]);

  const maxHeight = useSharedValue(
    currentValue ? 100 * (dependents?.length ?? 0) : 0,
  );
  const opacity = useSharedValue(1);
  const update = (value: unknown, key: ValueKey<SettingOrigin>) => {
    maxHeight.value = withTiming(value ? 100 * (dependents?.length ?? 0) : 0);
    opacity.value = withTiming(value ? 1 : 0, {
      easing: Easing.out(Easing.exp),
      reduceMotion: ReduceMotion.System,
    });
    //@ts-ignore
    up(value, key);
  };

  return (
    <>
      <SwitchItem
        value={currentValue}
        label={setting.title}
        description={quickSettings ? setting.description : undefined}
        onPress={() => update(!currentValue, setting.valueKey)}
        theme={theme}
        style={{ paddingHorizontal: 16 }}
        endOfLine={endOfLine}
      />
      {!dependents ? null : (
        <Animated.View style={{ maxHeight, opacity }}>
          {dependents.map((dep, i) => {
            return (
              <RenderSettings key={'dep' + setting.title + i} setting={dep} />
            );
          })}
        </Animated.View>
      )}
    </>
  );
}
