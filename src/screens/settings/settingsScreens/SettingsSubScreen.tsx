import React from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '@hooks/persisted';
import { Appbar, List } from '@components';
import S from '../Settings';
import RenderSettings from '../components/RenderSettingsGroup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { SettingsStackParamList } from '@navigators/types';

type Props = StackScreenProps<
  SettingsStackParamList,
  keyof Omit<SettingsStackParamList, 'Settings'>
> & { disableAppbar?: boolean };

const SettingsSubScreen: React.FC<Props> = ({
  navigation,
  route,
  disableAppbar,
}) => {
  const theme = useTheme();
  const Settings = S[route.params.settingsSource];
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{
        height: '100%',
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        paddingTop: disableAppbar ? 0 : insets.top,
      }}
    >
      {disableAppbar ? null : (
        <Appbar
          title={Settings.groupTitle}
          handleGoBack={navigation.goBack}
          theme={theme}
        />
      )}
      <List.Section>{Settings.subGroup.map(RenderSettings)}</List.Section>
    </ScrollView>
  );
};

export default SettingsSubScreen;
