import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import React, { RefObject, useMemo, useState } from 'react';
import color from 'color';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { useChapterGeneralSettings, useTheme } from '@hooks/persisted';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { getString } from '@strings/translations';

import ReaderSheetPreferenceItem from './ReaderSheetPreferenceItem';
import TextSizeSlider from './TextSizeSlider';
import ReaderThemeSelector from './ReaderThemeSelector';
import ReaderTextAlignSelector from './ReaderTextAlignSelector';
import ReaderValueChange from './ReaderValueChange';
import ReaderFontPicker from './ReaderFontPicker';
import { overlay } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

const ReaderTab: React.FC = () => {
  return (
    <View style={styles.readerTab}>
      <TextSizeSlider />
      <ReaderThemeSelector />
      <ReaderTextAlignSelector />
      <ReaderValueChange
        label={getString('readerScreen.bottomSheet.lineHeight')}
        valueKey="lineHeight"
      />
      <ReaderValueChange
        label={getString('readerScreen.bottomSheet.padding')}
        valueKey="padding"
        valueChange={2}
        min={0}
        max={50}
        decimals={0}
        unit="px"
      />
      <ReaderFontPicker />
    </View>
  );
};

const GeneralTab: React.FC = () => {
  const theme = useTheme();
  const {
    keepScreenOn,
    fullScreenMode,
    autoScroll,
    verticalSeekbar,
    showBatteryAndTime,
    showScrollPercentage,
    useVolumeButtons,
    swipeGestures,
    pageReader = false,
    removeExtraParagraphSpacing,
    bionicReading,
    tapToScroll = false,
    setChapterGeneralSettings,
  } = useChapterGeneralSettings();

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false}>
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.fullscreen')}
        onPress={() =>
          setChapterGeneralSettings({ fullScreenMode: !fullScreenMode })
        }
        value={fullScreenMode}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.autoscroll')}
        onPress={() => setChapterGeneralSettings({ autoScroll: !autoScroll })}
        value={autoScroll}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.verticalSeekbar')}
        onPress={() =>
          setChapterGeneralSettings({ verticalSeekbar: !verticalSeekbar })
        }
        value={verticalSeekbar}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.showBatteryAndTime')}
        onPress={() =>
          setChapterGeneralSettings({ showBatteryAndTime: !showBatteryAndTime })
        }
        value={showBatteryAndTime}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.showProgressPercentage')}
        onPress={() =>
          setChapterGeneralSettings({
            showScrollPercentage: !showScrollPercentage,
          })
        }
        value={showScrollPercentage}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.swipeGestures')}
        onPress={() =>
          setChapterGeneralSettings({ swipeGestures: !swipeGestures })
        }
        value={swipeGestures}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.pageReader')}
        onPress={() => setChapterGeneralSettings({ pageReader: !pageReader })}
        value={pageReader}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.removeExtraSpacing')}
        onPress={() =>
          setChapterGeneralSettings({
            removeExtraParagraphSpacing: !removeExtraParagraphSpacing,
          })
        }
        value={removeExtraParagraphSpacing}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.volumeButtonsScroll')}
        onPress={() =>
          setChapterGeneralSettings({ useVolumeButtons: !useVolumeButtons })
        }
        value={useVolumeButtons}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.bionicReading')}
        onPress={() =>
          setChapterGeneralSettings({ bionicReading: !bionicReading })
        }
        value={bionicReading}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.tapToScroll')}
        onPress={() => setChapterGeneralSettings({ tapToScroll: !tapToScroll })}
        value={tapToScroll}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.keepScreenOn')}
        onPress={() =>
          setChapterGeneralSettings({ keepScreenOn: !keepScreenOn })
        }
        value={keepScreenOn}
        theme={theme}
      />
    </BottomSheetScrollView>
  );
};

interface ReaderBottomSheetV2Props {
  bottomSheetRef: RefObject<BottomSheetModalMethods> | null;
}

const ReaderBottomSheetV2: React.FC<ReaderBottomSheetV2Props> = ({
  bottomSheetRef,
}) => {
  const theme = useTheme();

  const tabHeaderColor = overlay(2, theme.surface);
  const backgroundColor = tabHeaderColor;

  const renderScene = SceneMap({
    'readerTab': ReaderTab,
    'generalTab': GeneralTab,
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
        commonOptions={{
          label: ({ route, color }) => (
            <Text style={{ color }}>{route.title}</Text>
          ),
        }}
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

export default ReaderBottomSheetV2;

const styles = StyleSheet.create({
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  tabBar: {
    elevation: 0,
  },
  readerTab: {
    paddingVertical: 8,
  },
});
