import { StyleSheet, TextInput, View, Text } from 'react-native';
import { ThemeColors } from '@theme/types';
import useUpdateSettingsFn from '../SettingsGeneralScreen/utils/useUpdateSettingsFn';
import {
  NumberInputSetting,
  SettingOrigin,
  SwitchSetting,
} from '../Settings.d';
import {
  useAppSettings,
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useLastUpdate,
  useLibrarySettings,
} from '@hooks/persisted';
import { useMemo } from 'react';
import { defaultTo } from 'lodash-es';

interface SettingSwitchProps {
  setting: NumberInputSetting;
  theme: ThemeColors;
}

export default function SettingTextInput({
  setting,
  theme,
}: SettingSwitchProps) {
  const librarySettings = useLibrarySettings();
  const appSettings = useAppSettings();
  const { showLastUpdateTime } = useLastUpdate();
  const chapterSettings = useChapterGeneralSettings();
  const chapterReaderSettings = useChapterReaderSettings();
  const update = useUpdateSettingsFn(setting.settingOrigin)!;

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
  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];

  return (
    <View style={styles.autoScrollInterval}>
      <Text style={[labelStyle, styles.paddingRightM]} numberOfLines={2}>
        {setting.title}
      </Text>
      <TextInput
        style={labelStyle}
        defaultValue={defaultTo(currentValue, 10).toString()}
        keyboardType="numeric"
        onChangeText={text => {
          if (text) {
            //@ts-ignore
            update(text, setting.valueKey);
          }
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  fontSizeL: {
    fontSize: 16,
    width: 50,
    height: 46,
    textAlignVertical: 'center',
  },
  autoScrollInterval: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    //? overflow scroll because the animation looks better
    overflow: 'scroll',
  },
  paddingRightM: {
    paddingVertical: 12,
    flex: 1,
  },
});
