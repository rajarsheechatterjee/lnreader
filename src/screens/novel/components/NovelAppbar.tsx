import React, { useState } from 'react';
import { getString } from '@strings/translations';
import { Appbar, Menu } from 'react-native-paper';
import { ThemeColors } from '@theme/types';
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import EpubIconButton from './EpubIconButton';
import { ChapterInfo, NovelInfo } from '@database/types';

const NovelAppbar = ({
  novel,
  chapters,
  theme,
  isLocal,
  downloadChapters,
  deleteChapters,
  showEditInfoModal,
  downloadCustomChapterModal,
  setCustomNovelCover,
  goBack,
  shareNovel,
  showJumpToChapterModal,
  headerOpacity,
}: {
  novel: NovelInfo;
  chapters: ChapterInfo[];
  theme: ThemeColors;
  isLocal: boolean;
  downloadChapters: (amount: number | 'all' | 'unread') => void;
  deleteChapters: () => void;
  showEditInfoModal: React.Dispatch<React.SetStateAction<boolean>>;
  downloadCustomChapterModal: () => void;
  setCustomNovelCover: () => Promise<void>;
  goBack: () => void;
  shareNovel: () => void;
  showJumpToChapterModal: (arg: boolean) => void;
  headerOpacity: SharedValue<number>;
}) => {
  const headerOpacityStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      headerOpacity.value,
      [0, 1],
      ['transparent', theme.surface2 || theme.surface],
    );
    return {
      backgroundColor,
    };
  });

  const [downloadMenu, showDownloadMenu] = useState(false);
  const [extraMenu, showExtraMenu] = useState(false);

  return (
    <Animated.View style={[headerOpacityStyle]}>
      <Appbar.Header theme={{ colors: { ...theme, surface: 'transparent' } }}>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title="" />
        <EpubIconButton theme={theme} novel={novel} chapters={chapters} />
        <Appbar.Action icon="share-variant" onPress={shareNovel} />
        <Appbar.Action
          icon="text-box-search-outline"
          onPress={() => {
            showJumpToChapterModal(true);
          }}
        />
        {!isLocal && (
          <Menu
            visible={downloadMenu}
            onDismiss={() => showDownloadMenu(false)}
            anchor={
              <Appbar.Action
                icon="download-outline"
                onPress={() => showDownloadMenu(true)}
                theme={{ colors: theme }}
                style={{ paddingTop: 2 }}
                size={27}
              />
            }
            contentStyle={{ backgroundColor: theme.surface2 }}
          >
            <Menu.Item
              title={getString('novelScreen.download.next')}
              style={{ backgroundColor: theme.surface2 }}
              titleStyle={{ color: theme.onSurface }}
              onPress={() => {
                showDownloadMenu(false);
                downloadChapters(1);
              }}
            />
            <Menu.Item
              title={getString('novelScreen.download.next5')}
              style={{ backgroundColor: theme.surface2 }}
              titleStyle={{
                color: theme.onSurface,
              }}
              onPress={() => {
                showDownloadMenu(false);
                downloadChapters(5);
              }}
            />
            <Menu.Item
              title={getString('novelScreen.download.next10')}
              style={{ backgroundColor: theme.surface2 }}
              titleStyle={{
                color: theme.onSurface,
              }}
              onPress={() => {
                showDownloadMenu(false);
                downloadChapters(10);
              }}
            />
            <Menu.Item
              title={getString('novelScreen.download.custom')}
              style={{ backgroundColor: theme.surface2 }}
              titleStyle={{ color: theme.onSurface }}
              onPress={() => {
                downloadCustomChapterModal();
                showDownloadMenu(false);
              }}
            />
            <Menu.Item
              title={getString('novelScreen.download.unread')}
              style={{ backgroundColor: theme.surface2 }}
              titleStyle={{
                color: theme.onSurface,
              }}
              onPress={() => {
                showDownloadMenu(false);
                downloadChapters('unread');
              }}
            />
            <Menu.Item
              title={getString('common.all')}
              style={{ backgroundColor: theme.surface2 }}
              titleStyle={{
                color: theme.onSurface,
              }}
              onPress={() => {
                showDownloadMenu(false);
                downloadChapters('all');
              }}
            />
            <Menu.Item
              title={getString('novelScreen.download.delete')}
              style={{ backgroundColor: theme.surface2 }}
              titleStyle={{
                color: theme.onSurface,
              }}
              onPress={() => {
                showDownloadMenu(false);
                deleteChapters();
              }}
            />
          </Menu>
        )}
        <Menu
          visible={extraMenu}
          onDismiss={() => showExtraMenu(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => showExtraMenu(true)}
              theme={{ colors: theme }}
            />
          }
          contentStyle={{
            backgroundColor: theme.surface2,
          }}
        >
          <Menu.Item
            title={getString('novelScreen.edit.info')}
            style={{ backgroundColor: theme.surface2 }}
            titleStyle={{
              color: theme.onSurface,
            }}
            onPress={() => {
              showEditInfoModal(true);
              showExtraMenu(false);
            }}
          />
          <Menu.Item
            title={getString('novelScreen.edit.cover')}
            style={{ backgroundColor: theme.surface2 }}
            titleStyle={{
              color: theme.onSurface,
            }}
            onPress={() => {
              showExtraMenu(false);
              setCustomNovelCover;
            }}
          />
        </Menu>
      </Appbar.Header>
    </Animated.View>
  );
};

export default NovelAppbar;
