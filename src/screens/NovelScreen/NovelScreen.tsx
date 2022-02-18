import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, FlatList, View, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {ErrorScreen, LoadingScreen} from '../../components';
import {ChapterCard, NovelScreenHeader} from './components';

import {clearNovelReducer, getNovel} from '../../redux/novel/novelSlice';
import {
  useAppDispatch,
  useNovelReducer,
  useSavedNovelData,
  useTheme,
} from '../../redux/hooks';
import useDownloader from '../../hooks/useDownloader';
import {ChapterItem} from '../../database/types';
import useLibraryUpdates from '../UpdatesScreen/hooks/useLibraryUpdate';
import NovelBottomSheet from './components/NovelBottomSheet/NovelBottomSheet';
import {chapterSortOrders} from './utils/constants';
import {Portal} from 'react-native-paper';

interface NovelScreenProps {
  route: {
    params: {
      sourceId: number;
      novelUrl: string;
      novelName: string;
      novelCover: string;
    };
  };
}

const NovelScreen: React.FC<NovelScreenProps> = ({route}) => {
  const {novelUrl, sourceId} = route.params;

  const theme = useTheme();
  const {navigate} = useNavigation();

  const dispatch = useAppDispatch();

  const {loading, novel, chapters} = useNovelReducer();
  const [error, setError] = useState('');

  const {isUpdating, updateNovel} = useLibraryUpdates();

  const {downloadChapters} = useDownloader();

  let bottomSheetRef = useRef<any>(null);
  const expandBottomSheet = () => bottomSheetRef.current.show();

  const {sort = chapterSortOrders[0], filters = []} = useSavedNovelData(
    novel ? novel.novelId : -1,
  );

  const handleDownloadChapter = (chapter: ChapterItem) =>
    downloadChapters(sourceId, novelUrl, [chapter]);

  useEffect(() => {
    try {
      dispatch(getNovel({novelUrl, sourceId}));
    } catch (err) {
      setError(err.message);
    }
  }, [dispatch, novelUrl, sourceId, sort, JSON.stringify(filters)]);

  useEffect(() => {
    return () => {
      dispatch(clearNovelReducer());
    };
  }, [dispatch]);

  const navigateToChapter = (
    chapterId: number,
    chapterUrl: string,
    isBookmarked: number,
  ) =>
    navigate(
      'ReaderScreen' as never,
      {
        sourceId,
        novelId: novel?.novelId,
        novelName: novel?.novelName,
        chapterId,
        chapterUrl,
        isBookmarked,
      } as never,
    );

  return loading ? (
    <LoadingScreen theme={theme} />
  ) : error ? (
    <ErrorScreen theme={theme} />
  ) : novel ? (
    <View>
      <FlatList
        contentContainerStyle={styles.container}
        data={chapters}
        keyExtractor={item => item.chapterUrl}
        ListHeaderComponent={
          <NovelScreenHeader
            novel={novel}
            theme={theme}
            chapters={chapters}
            expandBottomSheet={expandBottomSheet}
          />
        }
        renderItem={({item}) => (
          <ChapterCard
            chapter={item}
            navigateToChapter={navigateToChapter}
            handleDownloadChapter={handleDownloadChapter}
            theme={theme}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isUpdating}
            onRefresh={() => novel && updateNovel(novel)}
            colors={[theme.onPrimary]}
            progressBackgroundColor={theme.primary}
          />
        }
      />
      {novel ? (
        <Portal>
          <NovelBottomSheet bottomSheetRef={bottomSheetRef} theme={theme} />
        </Portal>
      ) : null}
    </View>
  ) : null;
};

export default NovelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
