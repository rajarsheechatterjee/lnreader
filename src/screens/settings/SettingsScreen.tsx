import React from 'react';
import { View } from 'react-native';

import { Appbar, List } from '@components';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';
import { SettingsScreenProps } from '@navigators/types';
import Settings from './Settings';

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const theme = useTheme();

  return (
    <>
      <Appbar
        title={getString('common.settings')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {Object.typedKeys(Settings).map(key => {
          const setting = Settings[key];

          return (
            <List.Item
              key={setting.navigateParam}
              title={setting.groupTitle}
              icon={setting.icon}
              onPress={() =>
                navigation.navigate('SettingsStack', {
                  screen: key === 'reader' ? 'ReaderSettings' : 'SubScreen',
                  params: { settingsSource: key },
                })
              }
              theme={theme}
            />
          );
        })}

        <List.Item
          title={getString('common.backup')}
          icon="cloud-upload-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'BackupSettings',
              params: { settingsSource: 'general' },
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('advancedSettings')}
          icon="code-tags"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'AdvancedSettings',
              params: { settingsSource: 'general' },
            })
          }
          theme={theme}
        />
      </View>
    </>
  );
};

export default SettingsScreen;
