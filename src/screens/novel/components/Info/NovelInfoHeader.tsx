import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import color from 'color';

import * as Clipboard from 'expo-clipboard';

import { IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { showToast } from '@utils/showToast';

import {
  CoverImage,
  NovelInfo,
  NovelInfoContainer,
  NovelThumbnail,
  NovelTitle,
  NovelGenres,
  NovelRating,
} from './NovelInfoComponents';
import { Row } from '@components/Common';
import ReadButton from './ReadButton';
import NovelSummary from '../NovelSummary/NovelSummary';
import NovelScreenButtonGroup from '../NovelScreenButtonGroup/NovelScreenButtonGroup';
import { getString } from '@strings/translations';
import { filterColor } from '@theme/colors';
import { ChapterInfo, NovelInfo as NovelData } from '@database/types';
import { ThemeColors } from '@theme/types';
import { NovelScreenProps } from '@navigators/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { UseBooleanReturnType } from '@hooks';
import { useAppSettings } from '@hooks/persisted';
import { NovelStatus, PluginItem } from '@plugins/types';
import { translateNovelStatus } from '@utils/translateEnum';
import { getMMKVObject } from '@utils/mmkv/mmkv';
import { AVAILABLE_PLUGINS } from '@hooks/persisted/usePlugins';

interface NovelInfoHeaderProps {
  novel: NovelData;
  theme: ThemeColors;
  filter: string;
  chapters: ChapterInfo[];
  lastRead?: ChapterInfo;
  navigation: NovelScreenProps['navigation'];
  trackerSheetRef: React.RefObject<BottomSheetModalMethods>;
  navigateToChapter: (chapter: ChapterInfo) => void;
  setCustomNovelCover: () => Promise<void>;
  followNovel: () => void;
  novelBottomSheetRef: React.RefObject<BottomSheetModalMethods>;
  deleteDownloadsSnackbar: UseBooleanReturnType;
  page?: string;
  openDrawer: () => void;
  onRefreshPage: (page: string) => void;
}

const getStatusIcon = (status?: string) => {
  if (status === NovelStatus.Ongoing) {
    return 'clock-outline';
  }
  if (status === NovelStatus.Completed) {
    return 'check-all';
  }
  return 'help';
};

const NovelInfoHeader = ({
  novel,
  theme,
  filter,
  chapters,
  lastRead,
  navigation,
  trackerSheetRef,
  navigateToChapter,
  setCustomNovelCover,
  followNovel,
  novelBottomSheetRef,
  deleteDownloadsSnackbar,
  page,
  openDrawer,
  onRefreshPage,
}: NovelInfoHeaderProps) => {
  const { hideBackdrop = false } = useAppSettings();

  const pluginName = useMemo(
    () =>
      (getMMKVObject<PluginItem[]>(AVAILABLE_PLUGINS) || []).find(
        plugin => plugin.id === novel.pluginId,
      )?.name || novel.pluginId,
    [novel.pluginId],
  );

  return (
    <>
      <CoverImage
        source={{ uri: novel.cover }}
        theme={theme}
        hideBackdrop={hideBackdrop}
      >
        <NovelInfoContainer>
          <NovelThumbnail
            source={{ uri: novel.cover }}
            theme={theme}
            setCustomNovelCover={setCustomNovelCover}
          />
          <View style={styles.novelDetails}>
            <Row>
              <NovelTitle
                theme={theme}
                onPress={() =>
                  navigation.replace('GlobalSearchScreen', {
                    searchText: novel.name,
                  })
                }
                onLongPress={() => {
                  Clipboard.setStringAsync(novel.name).then(() =>
                    showToast(
                      getString('common.copiedToClipboard', {
                        name: novel.name,
                      }),
                    ),
                  );
                }}
              >
                {novel.name}
              </NovelTitle>
            </Row>
            {novel.author ? (
              <Row>
                <MaterialCommunityIcons
                  name="fountain-pen-tip"
                  size={14}
                  color={theme.onSurfaceVariant}
                  style={styles.icon}
                />
                <NovelInfo theme={theme}>{novel.author}</NovelInfo>
              </Row>
            ) : null}
            {novel.artist ? (
              <Row>
                <MaterialCommunityIcons
                  name="palette-outline"
                  size={14}
                  color={theme.onSurfaceVariant}
                  style={styles.icon}
                />
                <NovelInfo theme={theme}>{novel.artist}</NovelInfo>
              </Row>
            ) : null}
            <Row>
              <MaterialCommunityIcons
                name={getStatusIcon(novel.status)}
                size={14}
                color={theme.onSurfaceVariant}
                style={styles.icon}
              />
              <NovelInfo theme={theme}>
                {(translateNovelStatus(novel.status) ||
                  getString('novelScreen.unknownStatus')) +
                  ' • ' +
                  pluginName}
              </NovelInfo>
            </Row>
            {novel.rating ? (
              <Row>
                <NovelRating theme={theme} rating={novel.rating} />
                <NovelInfo theme={theme}>({novel.rating.toFixed(1)})</NovelInfo>
              </Row>
            ) : null}
          </View>
        </NovelInfoContainer>
      </CoverImage>
      <>
        <NovelScreenButtonGroup
          novel={novel}
          handleFollowNovel={() => {
            followNovel();
            if (
              novel.inLibrary &&
              chapters.some(chapter => chapter.isDownloaded)
            ) {
              deleteDownloadsSnackbar.setTrue();
            }
          }}
          handleTrackerSheet={() => trackerSheetRef.current?.present()}
          theme={theme}
        />
        <NovelSummary
          summary={novel.summary || getString('novelScreen.noSummary')}
          isExpanded={!novel.inLibrary}
          theme={theme}
        />
        {novel.genres ? (
          <NovelGenres theme={theme} genres={novel.genres} />
        ) : null}
        <ReadButton
          navigateToChapter={navigateToChapter}
          chapters={chapters}
          lastRead={lastRead}
        />
        <Pressable
          style={styles.bottomsheet}
          onPress={() =>
            page ? openDrawer() : novelBottomSheetRef.current?.present()
          }
          android_ripple={{
            color: color(theme.primary).alpha(0.12).string(),
          }}
        >
          <View style={{ flex: 1 }}>
            {page ? (
              <Text
                numberOfLines={2}
                style={[{ color: theme.onSurface }, styles.pageTitle]}
              >
                Page: {page}
              </Text>
            ) : null}
            <Text style={[{ color: theme.onSurface }, styles.chapters]}>
              {`${chapters?.length} ${getString('novelScreen.chapters')}`}
            </Text>
          </View>
          {page && Number(page) ? (
            <IconButton
              icon="reload"
              iconColor={theme.onSurface}
              size={24}
              onPress={() => onRefreshPage(page)}
            />
          ) : null}
          <IconButton
            icon="filter-variant"
            iconColor={filter ? filterColor(theme.isDark) : theme.onSurface}
            size={24}
            onPress={() => novelBottomSheetRef.current?.present()}
          />
        </Pressable>
      </>
    </>
  );
};

export default memo(NovelInfoHeader);

const styles = StyleSheet.create({
  novelDetails: {
    flex: 1,
    flexDirection: 'column',
    paddingBottom: 16,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  pageTitle: {
    paddingHorizontal: 16,
    fontSize: 16,
  },
  chapters: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  bottomsheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 12,
  },
  infoItem: {
    marginVertical: 2,
  },
  icon: {
    marginRight: 4,
    marginBottom: 4,
  },
});
