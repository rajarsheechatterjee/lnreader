import { Pressable, StyleSheet, View, Image } from 'react-native';
import React, { memo, useCallback, useRef, useState } from 'react';

import {
  ChapterInfo,
  DownloadedChapter,
  NovelInfo,
  Update,
  UpdateOverview,
} from '@database/types';
import { List } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ChapterItem from '@screens/novel/components/ChapterItem';
import { useDownload, useTheme, useUpdates } from '@hooks/persisted';
import { RootStackParamList } from '@navigators/types';
import { FlatList } from 'react-native-gesture-handler';
import { defaultCover } from '@plugins/helpers/constants';

const NovelCover = ({
  uri,
  navigateToNovel,
}: {
  uri: string;
  navigateToNovel: () => void;
}) => {
  return (
    <Pressable onPress={navigateToNovel} style={{ alignSelf: 'center' }}>
      <Image source={{ uri }} style={styles.cover} />
    </Pressable>
  );
};

type UpdateCardProps = {
  onlyDownloadedChapters?: boolean;
  descriptionText: string;
  deleteChapter: (chapter: Update | DownloadedChapter) => void;
} & (
  | { chapterList: Update[] | DownloadedChapter[]; chapterListInfo?: undefined }
  | {
      chapterListInfo: UpdateOverview;
      chapterList?: undefined;
    }
);

const UpdateNovelCard: React.FC<UpdateCardProps> = ({
  onlyDownloadedChapters = false,
  chapterList: chapterListRaw,
  chapterListInfo: chapterListInfoRaw,
  descriptionText,
  deleteChapter,
}) => {
  const { navigate } = useNavigation<NavigationProp<RootStackParamList>>();
  const { downloadChapter, downloadQueue } = useDownload();
  const { getDetailedUpdates, isLoading } = useUpdates();
  const [chapterList, setChapterList] = useState<
    Update[] | DownloadedChapter[]
  >(chapterListRaw ?? []);

  const chapterListInfo = useRef<UpdateOverview>(
    chapterListInfoRaw ?? {
      novelId: chapterList![0].novelId,
      novelName: chapterList![0].novelName,
      updateDate: chapterList![0].updatedTime ?? '',
      updatesPerDay: chapterList!.length,
      novelCover: chapterList![0].novelCover ?? '',
    },
  );
  const theme = useTheme();

  const updateList = async () => {
    getDetailedUpdates(
      chapterListInfo.current.novelId,
      onlyDownloadedChapters,
    ).then(res => {
      if (res.length) {
        setChapterList(res);
      }
    });
  };

  const handleDownloadChapter = (chapter: Update | DownloadedChapter) => {
    if (chapterListInfo.current.updatesPerDay) {
      downloadChapter(
        {
          id: chapter?.novelId,
          pluginId: chapter.pluginId,
          name: chapter.novelName,
        } as NovelInfo,
        chapter,
      );
    }
  };

  const navigateToChapter = useCallback((chapter: ChapterInfo) => {
    const { novelPath, pluginId, novelName } = chapter as
      | Update
      | DownloadedChapter;
    navigate('Chapter', {
      novel: {
        path: novelPath,
        pluginId: pluginId,
        name: novelName,
      } as NovelInfo,
      chapter: chapter,
    });
  }, []);

  const navigateToNovel = () => {
    if (chapterListInfo.current.updatesPerDay) {
      navigate('Novel', {
        pluginId: chapterList[0].pluginId,
        path: chapterList[0].novelPath,
        name: chapterList[0].novelName,
      });
    }
  };

  if (chapterListInfo.current.updatesPerDay > 1) {
    return (
      <List.Accordion
        title={chapterListInfo.current.novelName}
        titleStyle={{ fontSize: 14, color: theme.onSurface }}
        left={() => (
          <NovelCover
            navigateToNovel={navigateToNovel}
            uri={chapterListInfo.current.novelCover || defaultCover}
          />
        )}
        descriptionStyle={{ fontSize: 12 }}
        theme={{ colors: theme }}
        style={[styles.container, styles.padding]}
        description={`${chapterListInfo.current.updatesPerDay} ${descriptionText}`}
        onPress={updateList}
      >
        {chapterList.length > 0 ? (
          <FlatList
            data={chapterList}
            keyExtractor={it => 'update' + it.id}
            extraData={[chapterList, isLoading]}
            style={styles.chapterList}
            renderItem={({ item }) => {
              return (
                <ChapterItem
                  isLocal={false}
                  isDownloading={downloadQueue.some(
                    c => c.data.chapterId === item.id,
                  )}
                  isUpdateCard
                  novelName={chapterListInfo.current.novelName}
                  chapter={item}
                  theme={theme}
                  showChapterTitles={false}
                  downloadChapter={() => handleDownloadChapter(item)}
                  deleteChapter={() => deleteChapter(item)}
                  navigateToChapter={navigateToChapter}
                  left={
                    <View style={styles.novelCover}>
                      <NovelCover
                        navigateToNovel={navigateToNovel}
                        uri={chapterListInfo.current.novelCover || defaultCover}
                      />
                    </View>
                  }
                />
              );
            }}
            scrollEnabled={false}
          />
        ) : (
          <></>
        )}
      </List.Accordion>
    );
  } else if (chapterListInfo.current.updatesPerDay > 0) {
    return (
      <ChapterItem
        isLocal={false}
        isDownloading={downloadQueue.some(
          c => c.data.chapterId === chapterList[0].id,
        )}
        isUpdateCard
        novelName={chapterList[0].novelName}
        chapter={chapterList[0]}
        theme={theme}
        showChapterTitles={false}
        downloadChapter={() => handleDownloadChapter(chapterList[0])}
        deleteChapter={() => deleteChapter(chapterList[0])}
        navigateToChapter={navigateToChapter}
        left={
          <View style={styles.novelCover}>
            <NovelCover
              navigateToNovel={navigateToNovel}
              uri={chapterList[0].novelCover || defaultCover}
            />
          </View>
        }
      />
    );
  }
  return null;
};

export default memo(UpdateNovelCard);

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cover: {
    height: 40,
    width: 40,
    borderRadius: 4,
  },
  novelCover: {
    marginRight: 8,
  },
  chapterList: {
    marginLeft: -40,
  },
});
