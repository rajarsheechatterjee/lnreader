import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Appbar as MaterialAppbar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';

import { ScreenContainer } from '../../components/Common';
import EmptyView from '../../components/EmptyView';
import { Appbar, LoadingScreenV2 } from '@components';
import {
  deleteDownloads,
  getDownloadedChapters,
} from '../../database/queries/ChapterQueries';

import { useTheme } from '@hooks/useTheme';

import {
  deleteChapterAction,
  downloadChapterAction,
} from '../../redux/novel/novel.actions';

import RemoveDownloadsDialog from './components/RemoveDownloadsDialog';
import { openChapter, openNovel } from '@utils/handleNavigateParams';
import UpdateCard from '@screens/updates/components/UpdateCard/UpdateCard';

const Downloads = ({ navigation }) => {
  const theme = useTheme();

  const dispatch = useDispatch();

  const { downloadQueue } = useSelector(state => state.downloadsReducer);

  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);

  /**
   * Confirm Clear downloads Dialog
   */
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getChapters = async () => {
    const res = await getDownloadedChapters();
    setChapters(res);
    setLoading(false);
  };

  const ListEmptyComponent = () =>
    !loading && <EmptyView icon="(˘･_･˘)" description="No downloads" />;

  useEffect(() => {
    getChapters();
  }, []);

  const navigateToChapter = useCallback(
    item => navigation.navigate('Chapter', openChapter(item, item)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const navigateToNovel = useCallback(
    item => navigation.navigate('Novel', openNovel(item)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const downloadChapter = (
    sourceId,
    novelUrl,
    novelId,
    chapterUrl,
    chapterTitle,
    chapterId,
  ) =>
    dispatch(
      downloadChapterAction(
        sourceId,
        novelUrl,
        novelId,
        chapterUrl,
        chapterTitle,
        chapterId,
      ),
    );

  const deleteChapter = (sourceId, novelId, chapterId, chapterTitle) => {
    dispatch(deleteChapterAction(sourceId, novelId, chapterId, chapterTitle));
    setChapters(chaps => chaps.filter(item => item.chapterId !== chapterId));
  };

  const renderItem = ({ item }) => {
    return (
      <UpdateCard
        item={item}
        theme={theme}
        navigateToChapter={navigateToChapter}
        navigateToNovel={navigateToNovel}
        downloadQueue={downloadQueue}
        handleDeleteChapter={deleteChapter}
        handleDownloadChapter={downloadChapter}
      />
    );
  };

  return (
    <ScreenContainer theme={theme}>
      <Appbar title="Downloads" handleGoBack={navigation.goBack} theme={theme}>
        {chapters.length > 0 && (
          <MaterialAppbar.Action
            icon="delete-sweep"
            iconColor={theme.textColorPrimary}
            onPress={showDialog}
          />
        )}
      </Appbar>
      {loading ? (
        <LoadingScreenV2 theme={theme} />
      ) : (
        <FlatList
          contentContainerStyle={styles.flatList}
          data={chapters}
          keyExtractor={item => item.chapterId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<ListEmptyComponent />}
        />
      )}
      <RemoveDownloadsDialog
        dialogVisible={visible}
        hideDialog={hideDialog}
        onSubmit={() => {
          deleteDownloads();
          setChapters([]);
          hideDialog();
        }}
        theme={theme}
      />
    </ScreenContainer>
  );
};

export default Downloads;

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatList: { flexGrow: 1, paddingVertical: 8 },
});
