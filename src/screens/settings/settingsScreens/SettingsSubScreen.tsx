import React from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '@hooks/persisted';
import { Appbar, List } from '@components';
import S from '../Settings';
import RenderSettings from '../components/RenderSettings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { SettingsStackParamList } from '@navigators/types';

type Props = StackScreenProps<
  SettingsStackParamList,
  keyof Omit<SettingsStackParamList, 'Settings'>
>;

const SettingsSubScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const Settings = S[route.params.settingsSource];

  return (
    <SafeAreaView>
      <ScrollView>
        <Appbar
          title={Settings.groupTitle}
          handleGoBack={navigation.goBack}
          theme={theme}
        />

        <List.Section>{Settings.subGroup.map(RenderSettings)}</List.Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsSubScreen;
