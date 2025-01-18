import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabView,
} from 'react-native-tab-view';
import color from 'color';

import { SearchbarV2, Button } from '@components/index';
import { LibraryView } from './components/LibraryListView';
import LibraryBottomSheet from './components/LibraryBottomSheet/LibraryBottomSheet';
import { Banner } from './components/Banner';
import { Actionbar } from '@components/Actionbar/Actionbar';

import { useLibrary } from './hooks/useLibrary';
import {
  useAppSettings,
  useHistory,
  useLibrarySettings,
  useTheme,
} from '@hooks/persisted';
import { useSearch, useBackHandler, useBoolean } from '@hooks';
import { getString } from '@strings/translations';
import { FAB, Portal } from 'react-native-paper';
import {
  markAllChaptersRead,
  markAllChaptersUnread,
} from '@database/queries/ChapterQueries';
import { removeNovelsFromLibrary } from '@database/queries/NovelQueries';
import SetCategoryModal from '@screens/novel/components/SetCategoriesModal';
import { debounce } from 'lodash-es';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SourceScreenSkeletonLoading from '@screens/browse/loadingAnimation/SourceScreenSkeletonLoading';
import { Row } from '@components/Common';
import { LibraryScreenProps } from '@navigators/types';
import { NovelInfo } from '@database/types';
import * as DocumentPicker from 'expo-document-picker';
import ServiceManager from '@services/ServiceManager';

type State = NavigationState<{
  key: string;
  title: string;
}>;

const LibraryScreen = ({ navigation }: LibraryScreenProps) => {
  const theme = useTheme();
  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const {
    showNumberOfNovels = false,
    downloadedOnlyMode = false,
    incognitoMode = false,
  } = useLibrarySettings();

  const { useLibraryFAB = false } = useAppSettings();

  const { isLoading: isHistoryLoading, history, error } = useHistory();

  const { right: rightInset } = useSafeAreaInsets();

  const onChangeText = debounce((text: string) => {
    setSearchText(text);
  }, 100);

  const handleClearSearchbar = () => {
    clearSearchbar();
  };

  const { library, refetchLibrary, isLoading } = useLibrary({ searchText });
  const [selectedNovelIds, setSelectedNovelIds] = useState<number[]>([]);
  useBackHandler(() => {
    if (selectedNovelIds.length) {
      setSelectedNovelIds([]);
      return true;
    }

    return false;
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);

  const bottomSheetRef = useRef<BottomSheetModal | null>(null);

  useEffect(
    () =>
      navigation.addListener('tabPress', e => {
        if (navigation.isFocused()) {
          e.preventDefault();

          bottomSheetRef.current?.present?.();
        }
      }),
    [navigation],
  );

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State },
  ) =>
    library.length ? (
      <TabBar
        {...props}
        scrollEnabled
        indicatorStyle={{ backgroundColor: theme.primary, height: 3 }}
        style={[
          {
            backgroundColor: theme.surface,
            borderBottomColor: color(theme.isDark ? '#FFFFFF' : '#000000')
              .alpha(0.12)
              .string(),
          },
          styles.tabBar,
        ]}
        tabStyle={{ width: 'auto', minWidth: 100 }}
        gap={8}
        renderLabel={({ route, color }) => (
          <Row>
            <Text style={{ color, fontWeight: '600' }}>{route.title}</Text>
            {showNumberOfNovels ? (
              <View
                style={[
                  styles.badgeCtn,
                  { backgroundColor: theme.surfaceVariant },
                ]}
              >
                <Text
                  style={[styles.badgetText, { color: theme.onSurfaceVariant }]}
                >
                  {(route as any)?.novels.length}
                </Text>
              </View>
            ) : null}
          </Row>
        )}
        inactiveColor={theme.secondary}
        activeColor={theme.primary}
        android_ripple={{ color: theme.rippleColor }}
      />
    ) : null;

  const searchbarPlaceholder =
    selectedNovelIds.length === 0
      ? getString('libraryScreen.searchbar')
      : `${selectedNovelIds.length} selected`;

  const {
    value: setCategoryModalVisible,
    setTrue: showSetCategoryModal,
    setFalse: closeSetCategoryModal,
  } = useBoolean();

  function openRandom() {
    const novels = library[index].novels;
    const randomNovel = novels[Math.floor(Math.random() * novels.length)];
    if (randomNovel) {
      navigation.navigate('Novel', {
        name: randomNovel.name,
        path: randomNovel.path,
        pluginId: randomNovel.pluginId,
      });
    }
  }

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        clearSearchbar={handleClearSearchbar}
        placeholder={searchbarPlaceholder}
        onLeftIconPress={() => {
          if (selectedNovelIds.length > 0) {
            setSelectedNovelIds([]);
          }
        }}
        onChangeText={onChangeText}
        leftIcon={selectedNovelIds.length ? 'close' : 'magnify'}
        rightIcons={
          selectedNovelIds.length
            ? [
                {
                  iconName: 'select-all',
                  onPress: () =>
                    setSelectedNovelIds(
                      library[index].novels.map(novel => novel.id),
                    ),
                },
              ]
            : [
                {
                  iconName: 'filter-variant',
                  onPress: () => bottomSheetRef.current?.present(),
                },
              ]
        }
        menuButtons={[
          {
            title: getString('libraryScreen.extraMenu.updateLibrary'),
            onPress: () =>
              ServiceManager.manager.addTask({
                name: 'UPDATE_LIBRARY',
              }),
          },
          {
            title: getString('libraryScreen.extraMenu.updateCategory'),
            onPress: () =>
              //2 = local category
              library[index].id !== 2 &&
              ServiceManager.manager.addTask({
                name: 'UPDATE_LIBRARY',
                data: {
                  categoryId: library[index].id,
                  categoryName: library[index].name,
                },
              }),
          },
          {
            title: getString('libraryScreen.extraMenu.importEpub'),
            onPress: () => {
              DocumentPicker.getDocumentAsync({
                type: 'application/epub+zip',
                copyToCacheDirectory: true,
                multiple: true,
              }).then(res => {
                if (!res.canceled) {
                  ServiceManager.manager.addTask(
                    res.assets.map(asset => ({
                      name: 'IMPORT_EPUB',
                      data: {
                        filename: asset.name,
                        uri: asset.uri,
                      },
                    })),
                  );
                }
              });
            },
          },
          {
            title: getString('libraryScreen.extraMenu.openRandom'),
            onPress: openRandom,
          },
        ]}
        theme={theme}
      />
      {downloadedOnlyMode ? (
        <Banner
          icon="cloud-off-outline"
          label={getString('moreScreen.downloadOnly')}
          theme={theme}
        />
      ) : null}
      {incognitoMode ? (
        <Banner
          icon="incognito"
          label={getString('moreScreen.incognitoMode')}
          theme={theme}
          backgroundColor={theme.tertiary}
          textColor={theme.onTertiary}
        />
      ) : null}
      <TabView
        lazy
        navigationState={{
          index,
          routes: library.map(category => ({
            key: String(category.id),
            title: category.name,
            ...category,
          })),
        }}
        renderTabBar={renderTabBar}
        renderScene={({ route }) =>
          isLoading ? (
            <SourceScreenSkeletonLoading theme={theme} />
          ) : (
            <>
              {searchText ? (
                <Button
                  title={`${getString(
                    'common.searchFor',
                  )} "${searchText}" ${getString('common.globally')}`}
                  style={styles.globalSearchBtn}
                  onPress={() =>
                    navigation.navigate('GlobalSearchScreen', {
                      searchText,
                    })
                  }
                />
              ) : null}
              <LibraryView
                categoryId={route.id}
                categoryName={route.name}
                novels={route.novels}
                selectedNovelIds={selectedNovelIds}
                setSelectedNovelIds={setSelectedNovelIds}
                navigation={navigation}
              />
            </>
          )
        }
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      {useLibraryFAB &&
      !isHistoryLoading &&
      history &&
      history.length !== 0 &&
      !error ? (
        <FAB
          style={[
            styles.fab,
            { backgroundColor: theme.primary, marginRight: rightInset + 16 },
          ]}
          color={theme.onPrimary}
          uppercase={false}
          label={getString('common.resume')}
          icon="play"
          onPress={() => {
            navigation.navigate('Chapter', {
              novel: {
                path: history[0].novelPath,
                pluginId: history[0].pluginId,
                name: history[0].novelName,
              } as NovelInfo,
              chapter: history[0],
            });
          }}
        />
      ) : null}
      <SetCategoryModal
        novelIds={selectedNovelIds}
        closeModal={closeSetCategoryModal}
        onEditCategories={() => setSelectedNovelIds([])}
        visible={setCategoryModalVisible}
        onSuccess={() => {
          setSelectedNovelIds([]);
          refetchLibrary();
        }}
      />
      <LibraryBottomSheet
        bottomSheetRef={bottomSheetRef}
        category={library[index]}
      />
      <Portal>
        <Actionbar
          active={selectedNovelIds.length > 0}
          actions={[
            {
              icon: 'label-outline',
              onPress: showSetCategoryModal,
            },
            {
              icon: 'check',
              onPress: () => {
                selectedNovelIds.map(id => markAllChaptersRead(id));
                setSelectedNovelIds([]);
                refetchLibrary();
              },
            },
            {
              icon: 'check-outline',
              onPress: () => {
                selectedNovelIds.map(id => markAllChaptersUnread(id));
                setSelectedNovelIds([]);
                refetchLibrary();
              },
            },
            {
              icon: 'delete-outline',
              onPress: () => {
                removeNovelsFromLibrary(selectedNovelIds);
                setSelectedNovelIds([]);
                refetchLibrary();
              },
            },
          ]}
        />
      </Portal>
    </>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  tabBar: {
    elevation: 0,
    borderBottomWidth: 1,
  },
  globalSearchBtn: {
    margin: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  badgeCtn: {
    position: 'relative',
    borderRadius: 50,
    marginLeft: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgetText: {
    fontSize: 12,
  },
});
