import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';
import { ThemeColors } from '@theme/types';
import { useLibrarySettings } from '@hooks/persisted';
import { List } from '@components';
import { useBoolean } from '@hooks/index';
import settings, {
  ModalSetting,
  SettingsTypeModes,
} from '@screens/settings/Settings';
import {
  AppSettings,
  LibrarySettings,
  useAppSettings,
} from '@hooks/persisted/useSettings';
import { options } from 'sanitize-html';

interface DisplayModeModalProps<
  T extends keyof AppSettings | keyof LibrarySettings,
  V extends SettingsTypeModes,
> {
  //   setting: SettingsType<
  //     keyof AppSettings | keyof LibrarySettings,
  //     SettingsTypeModes
  //   >;
  setting: ModalSetting;
  //   value: any;
  theme: ThemeColors;
}

const DefaultSettingModal: React.FC<
  DisplayModeModalProps<
    keyof AppSettings | keyof LibrarySettings,
    SettingsTypeModes
  >
> = ({ theme, setting }) => {
  const modalRef = useBoolean();

  const { setLibrarySettings, ...librarySettings } = useLibrarySettings();
  const { setAppSettings, ...appSettings } = useAppSettings();
  console.log(useLibrarySettings());

  const update = (value: unknown) => {
    if (setting.mode === 'single') {
      if (setting.settingOrigin === 'Library') {
        setLibrarySettings({
          [setting.valueKey]: value,
        });
      } else {
        setAppSettings({
          [setting.valueKey]: value,
        });
      }
    }
  };
  const currentValue = () => {
    if (setting.mode === 'single') {
      if (setting.settingOrigin === 'Library') {
        return librarySettings[setting.valueKey] ?? setting.defaultValue;
      } else {
        return appSettings[setting.valueKey] ?? setting.defaultValue;
      }
    }
  };

  return (
    <>
      <List.Item
        title={setting.title}
        description={setting.options[currentValue()]?.label}
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
                  status={currentValue() === mode.value}
                  onPress={() => update(mode.value)}
                  label={mode.label}
                  theme={theme}
                />
              ))
            : null}
        </Modal>
      </Portal>
    </>
  );
};

export default DefaultSettingModal;

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
