import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import React, { Ref, useMemo, useState } from 'react';
import color from 'color';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { useTheme } from '@hooks/persisted';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { getString } from '@strings/translations';

import { overlay } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReaderSettings from '@screens/settings/settingsGroups/readerSettingsGroup';
import RenderSettings from '@screens/settings/dynamic/RenderSettings';
import { SettingsSubGroupSettings } from '@screens/settings/Settings.d';
import { List } from '@components';

const renderTab = (settings: SettingsSubGroupSettings[], tab: string) => {
  return (
    <View style={styles.readerTab}>
      <List.Section>
        {settings.map((v, i) => (
          <RenderSettings key={tab + i} setting={v} />
        ))}
      </List.Section>
    </View>
  );
};

interface ReaderBottomSheetV2Props {
  bottomSheetRef: Ref<BottomSheetModal> | null;
}

const ReaderBottomSheetV2: React.FC<ReaderBottomSheetV2Props> = ({
  bottomSheetRef,
}) => {
  const theme = useTheme();

  const tabHeaderColor = overlay(2, theme.surface);
  const backgroundColor = tabHeaderColor;

  const [settingsReaderTab, settingsGeneralTab, settingsDisplayTab] =
    useMemo(() => {
      return [
        ReaderSettings.subGroup
          .filter(v => ['readerTheme'].includes(v.id))
          .map(v => v.settings)
          .flat()
          .filter(v => v.quickSettings),
        ReaderSettings.subGroup
          .filter(v => ['autoScroll', 'general', 'tts'].includes(v.id))
          .map(v => v.settings)
          .flat()
          .filter(v => v.quickSettings),
        ReaderSettings.subGroup
          .filter(v => ['display'].includes(v.id))
          .map(v => v.settings)
          .flat()
          .filter(v => v.quickSettings),
      ];
    }, []);
  console.log(settingsReaderTab);

  const renderScene = SceneMap({
    'readerTab': () => renderTab(settingsReaderTab, 'readerTab'),
    'generalTab': () => renderTab(settingsGeneralTab, 'generalTab'),
    'displayTab': () => renderTab(settingsDisplayTab, 'displayTab'),
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      {
        key: 'readerTab',
        title: getString('readerSettings.title'),
      },
      {
        key: 'generalTab',
        title: getString('generalSettings'),
      },
      {
        key: 'displayTab',
        title: getString('common.display'),
      },
    ],
    [],
  );

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.primary }}
        style={[
          {
            backgroundColor: tabHeaderColor,
            borderBottomColor: theme.outline,
            borderBottomWidth: 0.5,
          },
          styles.tabBar,
        ]}
        renderLabel={({ route, color }) => (
          <Text style={{ color }}>{route.title}</Text>
        )}
        inactiveColor={theme.onSurfaceVariant}
        activeColor={theme.primary}
        pressColor={color(theme.primary).alpha(0.12).string()}
      />
    );
  };
  const { bottom } = useSafeAreaInsets();
  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      snapPoints={[360, 600]}
      backgroundStyle={{ backgroundColor }}
      bottomInset={bottom}
      containerStyle={{ borderRadius: 8 }}
    >
      <TabView
        navigationState={{ index, routes }}
        renderTabBar={renderTabBar}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
      />
    </BottomSheet>
  );
};

export default React.memo(ReaderBottomSheetV2, () => true);

const styles = StyleSheet.create({
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  tabBar: {
    elevation: 0,
  },
  readerTab: {
    // fontSize: 16,
    flex: 1,
    // flexShrink: 1,
  },
});
