import React from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '@hooks/persisted';
import { Appbar, List } from '@components';
import { NavigationState } from '@react-navigation/native';
import S from '../Settings';
import RenderSettings from '../components/RenderSettings';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GenralSettingsProps {
  navigation: NavigationState;
}

const GenralSettings: React.FC<GenralSettingsProps> = ({ navigation }) => {
  const theme = useTheme();
  const Settings = S.general;

  return (
    <SafeAreaView>
      <ScrollView>
        <Appbar
          title={Settings.groupTitle}
          // @ts-ignore
          handleGoBack={navigation.goBack}
          theme={theme}
        />

        <List.Section>{Settings.subGroup.map(RenderSettings)}</List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GenralSettings;
