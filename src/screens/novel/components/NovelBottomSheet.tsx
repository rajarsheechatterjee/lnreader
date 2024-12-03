import React, { useState } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import color from 'color';

import { TabView, SceneMap, TabBar, TabViewProps } from 'react-native-tab-view';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { getString } from '@strings/translations';

import { Checkbox, SortItem } from '@components/Checkbox/Checkbox';

import { overlay } from 'react-native-paper';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { ThemeColors } from '@theme/types';

interface ChaptersSettingsSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods>;
  sortAndFilterChapters: (sort?: string, filter?: string) => Promise<void>;
  sort: string;
  filter: string;
  theme: ThemeColors;
  showChapterTitles: boolean;
  setShowChapterTitles: (v: boolean) => void;
}

const ChaptersSettingsSheet = ({
  bottomSheetRef,
  sortAndFilterChapters,
  sort,
  filter,
  theme,
  showChapterTitles,
  setShowChapterTitles,
}: ChaptersSettingsSheetProps) => {
  const sortChapters = (val: string) => sortAndFilterChapters(val, filter);

  const filterChapters = (val: string) => sortAndFilterChapters(sort, val);

  const FirstRoute = () => (
    <View style={{ flex: 1 }}>
      <Checkbox
        theme={theme}
        label={getString('novelScreen.bottomSheet.filters.downloaded')}
        status={
          filter.match('AND isDownloaded=1')
            ? true
            : filter.match('AND isDownloaded=0')
            ? 'indeterminate'
            : false
        }
        onPress={() => {
          if (filter.match('AND isDownloaded=1')) {
            filterChapters(
              filter.replace(' AND isDownloaded=1', ' AND isDownloaded=0'),
            );
          } else if (filter.match('AND isDownloaded=0')) {
            filterChapters(filter.replace(' AND isDownloaded=0', ''));
          } else {
            filterChapters(filter + ' AND isDownloaded=1');
          }
        }}
      />
      <Checkbox
        theme={theme}
        label={getString('novelScreen.bottomSheet.filters.unread')}
        status={
          filter.match('AND `unread`=1')
            ? true
            : filter.match('AND `unread`=0')
            ? 'indeterminate'
            : false
        }
        onPress={() => {
          if (filter.match(' AND `unread`=1')) {
            filterChapters(
              filter.replace(' AND `unread`=1', ' AND `unread`=0'),
            );
          } else if (filter.match(' AND `unread`=0')) {
            filterChapters(filter.replace(' AND `unread`=0', ''));
          } else {
            filterChapters(filter + ' AND `unread`=1');
          }
        }}
      />
      <Checkbox
        theme={theme}
        label={getString('novelScreen.bottomSheet.filters.bookmarked')}
        status={!!filter.match('AND bookmark=1')}
        onPress={() => {
          filter.match('AND bookmark=1')
            ? filterChapters(filter.replace(' AND bookmark=1', ''))
            : filterChapters(filter + ' AND bookmark=1');
        }}
      />
    </View>
  );

  const SecondRoute = () => (
    <View style={{ flex: 1 }}>
      <SortItem
        label={getString('novelScreen.bottomSheet.order.bySource')}
        status={
          sort === 'ORDER BY position ASC'
            ? 'asc'
            : sort === 'ORDER BY position DESC'
            ? 'desc'
            : undefined
        }
        onPress={() =>
          sort === 'ORDER BY position ASC'
            ? sortChapters('ORDER BY position DESC')
            : sortChapters('ORDER BY position ASC')
        }
        theme={theme}
      />
      <SortItem
        label={getString('novelScreen.bottomSheet.order.byChapterName')}
        status={
          sort === 'ORDER BY name ASC'
            ? 'asc'
            : sort === 'ORDER BY name DESC'
            ? 'desc'
            : undefined
        }
        onPress={() =>
          sort === 'ORDER BY name ASC'
            ? sortChapters('ORDER BY name DESC')
            : sortChapters('ORDER BY name ASC')
        }
        theme={theme}
      />
    </View>
  );

  const ThirdRoute = () => (
    <View style={{ flex: 1 }}>
      <Checkbox
        status={showChapterTitles}
        label={getString('novelScreen.bottomSheet.displays.sourceTitle')}
        onPress={() => setShowChapterTitles(true)}
        theme={theme}
      />
      <Checkbox
        status={!showChapterTitles}
        label={getString('novelScreen.bottomSheet.displays.chapterNumber')}
        onPress={() => setShowChapterTitles(false)}
        theme={theme}
      />
    </View>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: getString('common.filter') },
    { key: 'second', title: getString('common.sort') },
    { key: 'third', title: getString('common.display') },
  ]);

  const renderTabBar: TabViewProps<any>['renderTabBar'] = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.primary }}
      style={{
        backgroundColor: overlay(2, theme.surface),
        borderBottomWidth: 1,
        borderBottomColor: theme.outline,
        elevation: 0,
      }}
      inactiveColor={theme.onSurfaceVariant}
      activeColor={theme.primary}
      pressColor={color(theme.primary).alpha(0.12).string()}
    />
  );

  return (
    <BottomSheet snapPoints={[240]} bottomSheetRef={bottomSheetRef}>
      <BottomSheetView
        style={[
          styles.contentContainer,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
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
          style={{ borderTopRightRadius: 8, borderTopLeftRadius: 8 }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ChaptersSettingsSheet;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
});
