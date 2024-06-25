import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Portal } from 'react-native-paper';

import { Button, List, ConfirmationDialog } from '@components';

import { useBoolean } from '@hooks';
import {
  useChapterReaderSettings,
  useAppSettings,
  useChapterGeneralSettings,
  useLastUpdate,
  useLibrarySettings,
} from '@hooks/persisted';
import { getString } from '@strings/translations';

import CustomFileModal from './CustomFileModal';
import { TextAreaSetting } from '@screens/settings/Settings';
import useUpdateSettingsFn from '@screens/settings/SettingsGeneralScreen/utils/useUpdateSettingsFn';
import { ThemeColors } from '@theme/types';

const TextAreaModal = ({
  setting,
  theme,
}: {
  setting: TextAreaSetting;
  theme: ThemeColors;
}) => {
  const showModal = useBoolean();
  const clearModal = useBoolean();

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
    return (res ?? setting.defaultValue) as string;
  }, [librarySettings, appSettings, showLastUpdateTime, chapterSettings]);

  return (
    <>
      <View style={styles.customCSSContainer}>
        <Text numberOfLines={3} style={[{ color: theme.onSurface }]}>
          {currentValue ||
            `${getString('common.example')}: ${setting.placeholder}`}
        </Text>
        <View style={styles.customCSSButtons}>
          <Button
            onPress={showModal.setTrue}
            style={styles.marginLeftS}
            title={getString('common.edit')}
          />
          <Button
            onPress={clearModal.setTrue}
            title={getString('common.clear')}
          />
        </View>
      </View>

      {/* Modals */}
      <Portal>
        <CustomFileModal
          visible={showModal.value}
          onDismiss={showModal.setFalse}
          defaultValue={currentValue}
          mimeType="text/css"
          title={setting.title}
          description={setting.description}
          placeholder={`${getString('common.example')}: ${setting.placeholder}`}
          openFileLabel={setting.openFileLabel}
          onSave={text => {
            if (text) {
              //@ts-ignore
              update(text, setting.valueKey);
            }
          }}
        />
        <ConfirmationDialog
          title={setting.clearDialog}
          visible={clearModal.value}
          onSubmit={() => {
            //@ts-ignore
            update('', setting.valueKey);
          }}
          onDismiss={clearModal.setFalse}
          theme={theme}
        />
      </Portal>
    </>
  );
};
export default TextAreaModal;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bottomInset: {
    paddingBottom: 40,
  },
  fontSizeL: {
    fontSize: 16,
  },
  customCSSContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  buttons: {
    flex: 1,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  customCSSButtons: {
    marginVertical: 8,
    flex: 1,
    flexDirection: 'row-reverse',
  },
  customThemeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
});
