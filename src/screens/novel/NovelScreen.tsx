import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, StatusBar, Text, Share } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
} from 'react-native-reanimated';

import { Portal, Appbar, Snackbar } from 'react-native-paper';
import { useDownload, useNovel, useTheme } from '@hooks/persisted';
import JumpToChapterModal from './components/JumpToChapterModal';
import { Actionbar } from '../../components/Actionbar/Actionbar';
import EditInfoModal from './components/EditInfoModal';
import { pickCustomNovelCover } from '../../database/queries/NovelQueries';
import DownloadCustomChapterModal from './components/DownloadCustomChapterModal';
import { useBoolean } from '@hooks';
import NovelScreenLoading from './components/LoadingAnimation/NovelScreenLoading';
import { NovelScreenProps } from '@navigators/types';
import { ChapterInfo } from '@database/types';
import { getString } from '@strings/translations';
import NovelDrawer from './components/NovelDrawer';
import { useFocusEffect } from '@react-navigation/native';
import { isNumber } from 'lodash-es';
import NovelAppbar from './components/NovelAppbar';
import { resolveUrl } from '@services/plugin/fetch';
import { updateChapterProgressByIds } from '@database/queries/ChapterQueries';
import { MaterialDesignIconName } from '@type/icon';
import NovelScreenList from './components/NovelScreenList';

const Novel = ({ route, navigation }: NovelScreenProps) => {
  const { name, path, pluginId, cover } = route.params;

  const {
    loading,
    pageIndex,
    pages,
    novel,
    chapters,
    openPage,
    setNovel,
    bookmarkChapters,
    markChaptersRead,
    markChaptersUnread,
    markPreviouschaptersRead,
    markPreviousChaptersUnread,
    refreshChapters,
    deleteChapters,
  } = useNovel(path, pluginId);
  const theme = useTheme();

  const { downloadQueue, downloadChapters } = useDownload();

  const [selected, setSelected] = useState<ChapterInfo[]>([]);
  const [editInfoModal, showEditInfoModal] = useState(false);

  let flatlistRef = useRef<FlashList<ChapterInfo>>(null);

  const deleteDownloadsSnackbar = useBoolean();

  const headerOpacity = useSharedValue(0);
  const {
    value: drawerOpen,
    setTrue: openDrawer,
    setFalse: closeDrawer,
  } = useBoolean();

  useEffect(() => {
    refreshChapters();
  }, [downloadQueue]);

  useFocusEffect(refreshChapters);

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
    const list: { icon: MaterialDesignIconName; onPress: () => void }[] = [];

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

  const setCustomNovelCover = async () => {
    if (!novel) {
      return;
    }
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
                chapters={chapters}
                deleteChapters={deleteChs}
                downloadChapters={downloadChs}
                showEditInfoModal={showEditInfoModal}
                setCustomNovelCover={setCustomNovelCover}
                downloadCustomChapterModal={downloadCustomChapterModal.setTrue}
                showJumpToChapterModal={showJumpToChapterModal}
                shareNovel={shareNovel}
                theme={theme}
                isLoading={loading}
                isLocal={novel?.isLocal}
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
            <Suspense fallback={<NovelScreenLoading theme={theme} />}>
              <NovelScreenList
                name={name}
                path={path}
                cover={cover}
                pluginId={pluginId}
                navigation={navigation}
                openDrawer={openDrawer}
                headerOpacity={headerOpacity}
              />
            </Suspense>
          </View>

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
            {novel && (
              <>
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
              </>
            )}
          </Portal>
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
});
