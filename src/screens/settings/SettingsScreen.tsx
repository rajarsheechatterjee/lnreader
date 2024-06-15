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
        {Object.keys(Settings).map(k => {
          const key = k as any as keyof typeof Settings;
          const setting = Settings[key];

          return (
            <List.Item
              title={setting.groupTitle}
              icon={setting.icon}
              onPress={() =>
                //@ts-ignore
                navigation.navigate('SettingsStack', {
                  screen: setting.navigateParam,
                })
              }
              theme={theme}
            />
          );
        })}

        <List.Item
          title={getString('readerSettings.title')}
          icon="book-open-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'ReaderSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title="Repositories"
          icon="github"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'RespositorySettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('tracking')}
          icon="sync"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'TrackerSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('common.backup')}
          icon="cloud-upload-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'BackupSettings',
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
            })
          }
          theme={theme}
        />
      </View>
    </>
  );
};

export default SettingsScreen;
