import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Appbar as MaterialAppbar } from 'react-native-paper';

import { ScreenContainer } from '@components/Common';
import EmptyView from '@components/EmptyView';
import { Appbar, List } from '@components';
import {
  deleteChapter,
  deleteDownloads,
  getDownloadedChapters,
} from '@database/queries/ChapterQueries';

import { useTheme } from '@hooks/persisted';

import RemoveDownloadsDialog from './components/RemoveDownloadsDialog';
import UpdatesSkeletonLoading from '@screens/updates/components/UpdatesSkeletonLoading';
import UpdateNovelCard from '@screens/updates/components/UpdateNovelCard';
import { getString } from '@strings/translations';
import { DownloadsScreenProps } from '@navigators/types';
import { DownloadedChapter } from '@database/types';
import { showToast } from '@utils/showToast';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';

type DownloadGroup = Record<number, DownloadedChapter[]>;

const Downloads = ({ navigation }: DownloadsScreenProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<DownloadedChapter[]>([]);
  const groupUpdatesByDate = (
    chapters: DownloadedChapter[],
  ): DownloadedChapter[][] => {
    const dateGroups = chapters.reduce((groups, item) => {
      const novelId = item.novelId;
      if (!groups[novelId]) {
        groups[novelId] = [];
      }

      groups[novelId].push(item);

      return groups;
    }, {} as DownloadGroup);
    return Object.values(dateGroups);
  };

  /**
   * Confirm Clear downloads Dialog
   */
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getChapters = async () => {
    const res = await getDownloadedChapters();
    setChapters(
      res.map(download => {
        const parsedTime = dayjs(download.releaseTime);
        return {
          ...download,
          releaseTime: parsedTime.isValid()
            ? parsedTime.format('LL')
            : download.releaseTime,
          chapterNumber: download.chapterNumber
            ? download.chapterNumber
            : parseChapterNumber(download.novelName, download.name),
        };
      }),
    );
  };

  const ListEmptyComponent = () =>
    !loading ? (
      <EmptyView
        icon="(˘･_･˘)"
        description={getString('downloadScreen.noDownloads')}
      />
    ) : null;

  useEffect(() => {
    getChapters().finally(() => setLoading(false));
  }, []);

  return (
    <ScreenContainer theme={theme}>
      <Appbar
        title={getString('common.downloads')}
        handleGoBack={navigation.goBack}
        theme={theme}
      >
        {chapters.length > 0 ? (
          <MaterialAppbar.Action
            icon="delete-sweep"
            iconColor={theme.onSurface}
            onPress={showDialog}
          />
        ) : null}
      </Appbar>
      <List.InfoItem title={getString('downloadScreen.dbInfo')} theme={theme} />
      {loading ? (
        <UpdatesSkeletonLoading theme={theme} />
      ) : (
        <FlatList
          contentContainerStyle={styles.flatList}
          data={groupUpdatesByDate(chapters)}
          keyExtractor={(item, index) => 'downloadGroup' + index}
          renderItem={({ item }) => {
            return (
              <UpdateNovelCard
                onlyDownloadedChapters
                chapterList={item}
                descriptionText={getString('downloadScreen.downloadsLower')}
                deleteChapter={chapter => {
                  deleteChapter(
                    chapter.pluginId,
                    chapter.novelId,
                    chapter.id,
                  ).then(() => {
                    showToast(`${getString('common.delete')} ${chapter.name}`);
                    getChapters();
                  });
                }}
              />
            );
          }}
          ListEmptyComponent={<ListEmptyComponent />}
        />
      )}
      <RemoveDownloadsDialog
        dialogVisible={visible}
        hideDialog={hideDialog}
        onSubmit={() => {
          deleteDownloads(chapters);
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
