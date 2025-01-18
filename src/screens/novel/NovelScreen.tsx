import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  StatusBar,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
} from 'react-native-reanimated';

import { Portal, Appbar, Snackbar, AnimatedFAB } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { showToast } from '../../utils/showToast';
import {
  useAppSettings,
  useDownload,
  useNovel,
  useTheme,
} from '@hooks/persisted';
import NovelInfoHeader from './components/Info/NovelInfoHeader';
import NovelBottomSheet from './components/NovelBottomSheet';
import TrackSheet from './components/Tracker/TrackSheet';
import JumpToChapterModal from './components/JumpToChapterModal';
import { Actionbar } from '../../components/Actionbar/Actionbar';
import EditInfoModal from './components/EditInfoModal';
import { pickCustomNovelCover } from '../../database/queries/NovelQueries';
import DownloadCustomChapterModal from './components/DownloadCustomChapterModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoolean } from '@hooks';
import NovelScreenLoading from './components/LoadingAnimation/NovelScreenLoading';
import { NovelScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import ChapterItem from './components/ChapterItem';
import { getString } from '@strings/translations';
import NovelDrawer from './components/NovelDrawer';
import {
  updateNovel,
  updateNovelPage,
} from '@services/updates/LibraryUpdateQueries';
import { useFocusEffect } from '@react-navigation/native';
import { isNumber } from 'lodash-es';
import NovelAppbar from './components/NovelAppbar';
import { resolveUrl } from '@services/plugin/fetch';
import { updateChapterProgressByIds } from '@database/queries/ChapterQueries';

const Novel = ({ route, navigation }: NovelScreenProps) => {
  const { name, path, pluginId } = route.params;
  const [updating, setUpdating] = useState(false);
  const {
    useFabForContinueReading,
    defaultChapterSort,
    disableHapticFeedback,
    downloadNewChapters,
    refreshNovelMetadata,
  } = useAppSettings();
  const {
    loading,
    pageIndex,
    pages,
    novel,
    chapters,
    lastRead,
    novelSettings: {
      sort = defaultChapterSort,
      filter = '',
      showChapterTitles = false,
    },
    openPage,
    setNovel,
    getNovel,
    sortAndFilterChapters,
    setShowChapterTitles,
    bookmarkChapters,
    markChaptersRead,
    markChaptersUnread,
    markPreviouschaptersRead,
    markPreviousChaptersUnread,
    followNovel,
    deleteChapter,
    refreshChapters,
    deleteChapters,
  } = useNovel(path, pluginId);

  const theme = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();

  const { downloadQueue, downloadChapter, downloadChapters } = useDownload();

  const [selected, setSelected] = useState<ChapterInfo[]>([]);
  const [editInfoModal, showEditInfoModal] = useState(false);
  const [isFabExtended, setIsFabExtended] = useState(true);

  let flatlistRef = useRef<FlashList<ChapterInfo>>(null);
  let novelBottomSheetRef = useRef(null);
  let trackerSheetRef = useRef(null);

  const deleteDownloadsSnackbar = useBoolean();

  const headerOpacity = useSharedValue(0);
  const {
    value: drawerOpen,
    setTrue: openDrawer,
    setFalse: closeDrawer,
  } = useBoolean();

  const onPageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    headerOpacity.value = y < 50 ? 0 : (y - 50) / 150;
    const currentScrollPosition = Math.floor(y) ?? 0;
    if (useFabForContinueReading && lastRead) {
      setIsFabExtended(currentScrollPosition <= 0);
    }
  };

  useEffect(() => {
    refreshChapters();
  }, [downloadQueue]);

  useFocusEffect(refreshChapters);

  const onRefresh = () => {
    if (novel) {
      setUpdating(true);
      updateNovel(pluginId, novel.path, novel.id, {
        downloadNewChapters,
        refreshNovelMetadata,
      })
        .then(() => getNovel())
        .then(() =>
          showToast(
            getString('novelScreen.updatedToast', { name: novel.name }),
          ),
        )
        .catch(error => showToast(error.message))
        .finally(() => setUpdating(false));
    }
  };

  const onRefreshPage = (page: string) => {
    if (novel) {
      setUpdating(true);
      updateNovelPage(pluginId, novel.path, novel.id, page, {
        downloadNewChapters,
      })
        .then(() => getNovel())
        .then(() => showToast(`Updated page: ${page}`))
        .catch(e => showToast(e.message))
        .finally(() => setUpdating(false));
    }
  };

  const refreshControl = () => (
    <RefreshControl
      progressViewOffset={topInset + 32}
      onRefresh={onRefresh}
      refreshing={updating}
      colors={[theme.primary]}
      progressBackgroundColor={theme.onPrimary}
    />
  );

  const downloadChs = (amount: number | 'all' | 'unread') => {
    if (!novel) {
      return;
    }
    let filtered = chapters.filter(chapter => !chapter.isDownloaded);
    if (amount === 'unread') {
      filtered = filtered.filter(chapter => chapter.unread);
    }
    if (isNumber(amount)) {
      filtered = filtered.slice(0, amount);
    }
    if (filtered) {
      downloadChapters(novel, filtered);
    }
  };
  const deleteChs = () => {
    deleteChapters(chapters.filter(c => c.isDownloaded));
  };
  const shareNovel = () => {
    if (!novel) {
      return;
    }
    Share.share({
      message: resolveUrl(novel.pluginId, novel.path, true),
    });
  };

  const [jumpToChapterModal, showJumpToChapterModal] = useState(false);
  const downloadCustomChapterModal = useBoolean();

  const actions = useMemo(() => {
    const list = [];

    if (!novel?.isLocal && selected.some(obj => !obj.isDownloaded)) {
      list.push({
        icon: 'download-outline',
        onPress: () => {
          if (novel) {
            downloadChapters(
              novel,
              selected.filter(chapter => !chapter.isDownloaded),
            );
          }
          setSelected([]);
        },
      });
    }
    if (!novel?.isLocal && selected.some(obj => obj.isDownloaded)) {
      list.push({
        icon: 'trash-can-outline',
        onPress: () => {
          deleteChapters(selected.filter(chapter => chapter.isDownloaded));
          setSelected([]);
        },
      });
    }

    list.push({
      icon: 'bookmark-outline',
      onPress: () => {
        bookmarkChapters(selected);
        setSelected([]);
      },
    });

    if (selected.some(obj => obj.unread)) {
      list.push({
        icon: 'check',
        onPress: () => {
          markChaptersRead(selected);
          setSelected([]);
        },
      });
    }

    if (selected.some(obj => !obj.unread)) {
      const chapterIds = selected.map(chapter => chapter.id);

      list.push({
        icon: 'check-outline',
        onPress: () => {
          markChaptersUnread(selected);
          updateChapterProgressByIds(chapterIds, 0);
          setSelected([]);
          refreshChapters();
        },
      });
    }

    if (selected.length === 1) {
      if (selected[0].unread) {
        list.push({
          icon: 'playlist-check',
          onPress: () => {
            markPreviouschaptersRead(selected[0].id);
            setSelected([]);
          },
        });
      } else {
        list.push({
          icon: 'playlist-remove',
          onPress: () => {
            markPreviousChaptersUnread(selected[0].id);
            setSelected([]);
          },
        });
      }
    }

    return list;
  }, [selected]);

  const isSelected = (id: number) => {
    return selected.some(obj => obj.id === id);
  };

  const onSelectPress = (chapter: ChapterInfo) => {
    if (selected.length === 0) {
      navigateToChapter(chapter);
    } else {
      if (isSelected(chapter.id)) {
        setSelected(sel => sel.filter(it => it.id !== chapter.id));
      } else {
        setSelected(sel => [...sel, chapter]);
      }
    }
  };

  const onSelectLongPress = (chapter: ChapterInfo) => {
    if (selected.length === 0) {
      if (!disableHapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setSelected(sel => [...sel, chapter]);
    } else {
      if (selected.length === chapters.length) {
        return;
      }

      /**
       * Select custom range
       */
      const lastSelectedChapter = selected[selected.length - 1];

      if (lastSelectedChapter.id !== chapter.id) {
        if (lastSelectedChapter.id > chapter.id) {
          setSelected(sel => [
            ...sel,
            chapter,
            ...chapters.filter(
              (chap: ChapterInfo) =>
                (chap.id <= chapter.id || chap.id >= lastSelectedChapter.id) ===
                false,
            ),
          ]);
        } else {
          setSelected(sel => [
            ...sel,
            chapter,
            ...chapters.filter(
              (chap: ChapterInfo) =>
                (chap.id >= chapter.id || chap.id <= lastSelectedChapter.id) ===
                false,
            ),
          ]);
        }
      }
    }
  };
  if (loading) {
    return <NovelScreenLoading theme={theme} />;
  }
  if (!novel) {
    return null;
  }
  const navigateToChapter = (chapter: ChapterInfo) => {
    navigation.navigate('Chapter', { novel, chapter });
  };

  const setCustomNovelCover = async () => {
    const newCover = await pickCustomNovelCover(novel);
    if (newCover) {
      setNovel({
        ...novel,
        cover: newCover,
      });
    }
  };

  return (
    <Drawer
      open={drawerOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      swipeEnabled={pages.length > 1}
      hideStatusBarOnOpen={true}
      swipeMinVelocity={1000}
      drawerStyle={{ backgroundColor: 'transparent' }}
      renderDrawerContent={() => (
        <NovelDrawer
          theme={theme}
          pages={pages}
          pageIndex={pageIndex}
          openPage={openPage}
          closeDrawer={closeDrawer}
        />
      )}
    >
      <Portal.Host>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Portal>
            {selected.length === 0 ? (
              <NovelAppbar
                novel={novel}
                chapters={
                  sort.includes('DESC') ? chapters.slice().reverse() : chapters
                }
                deleteChapters={deleteChs}
                downloadChapters={downloadChs}
                showEditInfoModal={showEditInfoModal}
                setCustomNovelCover={setCustomNovelCover}
                downloadCustomChapterModal={downloadCustomChapterModal.setTrue}
                showJumpToChapterModal={showJumpToChapterModal}
                shareNovel={shareNovel}
                theme={theme}
                isLocal={novel.isLocal}
                goBack={navigation.goBack}
                headerOpacity={headerOpacity}
              />
            ) : (
              <Animated.View
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(150)}
                style={{
                  position: 'absolute',
                  width: '100%',
                  elevation: 2,
                  backgroundColor: theme.surface2,
                  paddingTop: StatusBar.currentHeight || 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: 8,
                }}
              >
                <Appbar.Action
                  icon="close"
                  iconColor={theme.onBackground}
                  onPress={() => setSelected([])}
                />
                <Appbar.Content
                  title={`${selected.length}`}
                  titleStyle={{ color: theme.onSurface }}
                />
                <Appbar.Action
                  icon="select-all"
                  iconColor={theme.onBackground}
                  onPress={() => {
                    setSelected(chapters);
                  }}
                />
              </Animated.View>
            )}
          </Portal>
          <View style={{ minHeight: 3, flex: 1 }}>
            <FlashList
              ref={flatlistRef}
              estimatedItemSize={64}
              data={chapters}
              extraData={[chapters]}
              removeClippedSubviews={true}
              renderItem={({ item }) => (
                <ChapterItem
                  isDownloading={downloadQueue.some(
                    c => c.task.data.chapterId === item.id,
                  )}
                  isLocal={novel.isLocal}
                  theme={theme}
                  chapter={item}
                  showChapterTitles={showChapterTitles}
                  deleteChapter={() => deleteChapter(item)}
                  downloadChapter={() => downloadChapter(novel, item)}
                  isSelected={isSelected}
                  onSelectPress={onSelectPress}
                  onSelectLongPress={onSelectLongPress}
                  navigateToChapter={navigateToChapter}
                  novelName={name}
                />
              )}
              keyExtractor={item => 'chapter_' + item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListHeaderComponent={
                <NovelInfoHeader
                  novel={novel}
                  theme={theme}
                  filter={filter}
                  lastRead={lastRead}
                  setCustomNovelCover={setCustomNovelCover}
                  chapters={chapters}
                  navigation={navigation}
                  navigateToChapter={navigateToChapter}
                  followNovel={followNovel}
                  trackerSheetRef={trackerSheetRef}
                  novelBottomSheetRef={novelBottomSheetRef}
                  deleteDownloadsSnackbar={deleteDownloadsSnackbar}
                  page={pages.length > 1 ? pages[pageIndex] : undefined}
                  onRefreshPage={onRefreshPage}
                  openDrawer={openDrawer}
                />
              }
              refreshControl={refreshControl()}
              onScroll={onPageScroll}
            />
          </View>
          {useFabForContinueReading && lastRead ? (
            <AnimatedFAB
              style={[
                styles.fab,
                { backgroundColor: theme.primary, marginBottom: bottomInset },
              ]}
              extended={isFabExtended}
              color={theme.onPrimary}
              uppercase={false}
              label={getString('common.resume')}
              icon="play"
              onPress={() => {
                if (lastRead) {
                  navigation.navigate('Chapter', {
                    novel: novel,
                    chapter: lastRead,
                  });
                }
              }}
            />
          ) : null}
          <Portal>
            <Actionbar active={selected.length > 0} actions={actions} />
            <Snackbar
              visible={deleteDownloadsSnackbar.value}
              onDismiss={deleteDownloadsSnackbar.setFalse}
              action={{
                label: getString('common.delete'),
                onPress: () => {
                  deleteChapters(chapters.filter(c => c.isDownloaded));
                },
              }}
              theme={{ colors: { primary: theme.primary } }}
              style={{ backgroundColor: theme.surface, marginBottom: 32 }}
            >
              <Text style={{ color: theme.onSurface }}>
                {getString('novelScreen.deleteMessage')}
              </Text>
            </Snackbar>
          </Portal>
          <Portal>
            <JumpToChapterModal
              modalVisible={jumpToChapterModal}
              hideModal={() => showJumpToChapterModal(false)}
              chapters={chapters}
              novel={novel}
              chapterListRef={flatlistRef.current}
              navigation={navigation}
            />
            <EditInfoModal
              modalVisible={editInfoModal}
              hideModal={() => showEditInfoModal(false)}
              novel={novel}
              setNovel={setNovel}
              theme={theme}
            />
            <DownloadCustomChapterModal
              modalVisible={downloadCustomChapterModal.value}
              hideModal={downloadCustomChapterModal.setFalse}
              novel={novel}
              chapters={chapters}
              theme={theme}
              downloadChapters={downloadChapters}
            />
          </Portal>
          <NovelBottomSheet
            bottomSheetRef={novelBottomSheetRef}
            sortAndFilterChapters={sortAndFilterChapters}
            setShowChapterTitles={setShowChapterTitles}
            sort={sort}
            theme={theme}
            filter={filter}
            showChapterTitles={showChapterTitles}
          />
          <TrackSheet
            bottomSheetRef={trackerSheetRef}
            novel={novel}
            theme={theme}
          />
        </View>
      </Portal.Host>
    </Drawer>
  );
};

export default Novel;

const styles = StyleSheet.create({
  container: { flex: 1 },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
});
