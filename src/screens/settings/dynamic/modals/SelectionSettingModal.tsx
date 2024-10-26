import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';
import { ThemeColors } from '@theme/types';
import { useLibrarySettings } from '@hooks/persisted';
import { Checkbox, List } from '@components';
import { useBoolean } from '@hooks/index';
import { ModalSetting, SettingsTypeModes } from '@screens/settings/Settings.d';
import {
  AppSettings,
  LibrarySettings,
  useAppSettings,
} from '@hooks/persisted/useSettings';
import { SortItem } from '@components/Checkbox/Checkbox';
import useUpdateSettingsFn from '@screens/settings/SettingsGeneralScreen/utils/useUpdateSettingsFn';

interface DisplayModeModalProps<
  T extends keyof AppSettings | keyof LibrarySettings,
  V extends SettingsTypeModes,
> {
  setting: ModalSetting;
  theme: ThemeColors;
  quickSettings?: boolean;
}

const SelectionSettingModal: React.FC<
  DisplayModeModalProps<
    keyof AppSettings | keyof LibrarySettings,
    SettingsTypeModes
  >
> = ({ theme, setting, quickSettings }) => {
  const modalRef = useBoolean();

  const { setLibrarySettings, ...librarySettings } = useLibrarySettings();
  const { setAppSettings, ...appSettings } = useAppSettings();

  const update = useUpdateSettingsFn(setting.settingOrigin);
  const currentValue = useMemo(() => {
    if (setting.mode === 'single' || setting.mode === 'order') {
      if (setting.settingOrigin === 'Library') {
        return librarySettings[setting.valueKey] ?? setting.defaultValue;
      } else {
        return appSettings[setting.valueKey] ?? setting.defaultValue;
      }
    } else if (setting.mode === 'multiple') {
      if (setting.settingOrigin === 'Library') {
        return setting.valueKey.map((k, i) => {
          return librarySettings[k] ?? setting.defaultValue[i];
        });
      } else {
        return setting.valueKey.map((k, i) => {
          return appSettings[k] ?? setting.defaultValue[i];
        });
      }
    }
    return 0;
  }, [librarySettings, appSettings]);

  function generateDescription() {
    if (!setting.description || quickSettings) {
      return;
    }
    //@ts-expect-error
    return setting.description(currentValue);
  }

  return (
    <>
      <List.Item
        title={setting.title}
        description={generateDescription()}
        onPress={modalRef.setTrue}
        theme={theme}
      />
      <Portal>
        <Modal
          visible={modalRef.value}
          onDismiss={modalRef.setFalse}
          contentContainerStyle={[
            styles.containerStyle,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
            {setting.title}
          </Text>
          {setting.mode === 'single'
            ? setting.options.map(mode => (
                <RadioButton
                  key={mode.value}
                  status={currentValue === mode.value}
                  onPress={() => update(mode.value, setting.valueKey)}
                  label={mode.label}
                  theme={theme}
                />
              ))
            : setting.mode === 'multiple'
            ? setting.options.map((mode, i) => {
                return (
                  <Checkbox
                    key={mode.label}
                    label={mode.label} //@ts-ignore
                    status={currentValue[i]}
                    onPress={() =>
                      //@ts-expect-error
                      update(!currentValue[i], setting.valueKey[i])
                    }
                    theme={theme}
                  />
                );
              })
            : setting.mode === 'order'
            ? setting.options.map((mode, i) => {
                return (
                  <SortItem
                    key={mode.label}
                    label={mode.label}
                    theme={theme}
                    status={
                      currentValue === mode.ASC
                        ? 'asc'
                        : currentValue === mode.DESC
                        ? 'desc'
                        : undefined
                    }
                    onPress={() =>
                      update(
                        currentValue === mode.ASC ? mode.DESC : mode.ASC,
                        setting.valueKey,
                      )
                    }
                  />
                );
              })
            : null}
        </Modal>
      </Portal>
    </>
  );
};

export default React.memo(SelectionSettingModal);

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 28,
  },
  modalHeader: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 10,
  },
});
