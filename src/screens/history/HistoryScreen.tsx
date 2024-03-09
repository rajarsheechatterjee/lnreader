import React, { useState } from 'react';
import { StyleSheet, SectionList, Text } from 'react-native';
import dayjs from 'dayjs';
import { Portal } from 'react-native-paper';

import { EmptyView, ErrorScreenV2, SearchbarV2 } from '@components';
import HistoryCard from './components/HistoryCard/HistoryCard';

import { useSearch, useBoolean } from '@hooks';
import { useTheme, useHistory } from '@hooks/persisted';

import { convertDateToISOString } from '@database/utils/convertDateToISOString';

import { History } from '@database/types';
import { getString } from '@strings/translations';
import ClearHistoryDialog from './components/ClearHistoryDialog';
import HistorySkeletonLoading from './components/HistorySkeletonLoading';
import { HistoryScreenProps } from '@navigators/types';

const HistoryScreen = ({ navigation }: HistoryScreenProps) => {
  const theme = useTheme();
  const {
    isLoading,
    history,
    clearAllHistory,
    removeChapterFromHistory,
    error,
  } = useHistory();

  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const [searchResults, setSearchResults] = useState<History[]>([]);

  const onChangeText = (text: string) => {
    setSearchText(text);
    setSearchResults(
      history.filter(item =>
        item.novelName.toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  };

  const groupHistoryByDate = (rawHistory: History[]) => {
    const dateGroups = rawHistory.reduce<Record<string, History[]>>(
      (groups, item) => {
        const date = convertDateToISOString(item.readTime);
        if (!groups[date]) {
          groups[date] = [];
        }
        const lastNovel = groups[date][groups[date].length - 1];

        if (
          (lastNovel?.novelId === item.novelId && lastNovel.startChapter) ??
          lastNovel.chapterNumber === (item.chapterNumber ?? 0) + 1
        ) {
          groups[date][groups[date].length - 1] = {
            ...lastNovel,
            endChapter: lastNovel.endChapter ?? lastNovel.chapterNumber,
            startChapter: item.chapterNumber,
          };
        } else {
          groups[date].push(item);
        }

        return groups;
      },
      {},
    );

    const groupedHistory = Object.keys(dateGroups).map(date => {
      return {
        date,
        data: dateGroups[date],
      };
    });
    // console.log(JSON.stringify(groupedHistory, null, 2));

    return groupedHistory;
  };

  const {
    value: clearHistoryDialogVisible,
    setTrue: openClearHistoryDialog,
    setFalse: closeClearHistoryDialog,
  } = useBoolean();

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        placeholder={getString('historyScreen.searchbar')}
        leftIcon="magnify"
        onChangeText={onChangeText}
        clearSearchbar={clearSearchbar}
        rightIcons={[
          {
            iconName: 'delete-sweep-outline',
            onPress: openClearHistoryDialog,
          },
        ]}
        theme={theme}
      />
      {isLoading ? (
        <HistorySkeletonLoading theme={theme} />
      ) : error ? (
        <ErrorScreenV2 error={error} />
      ) : (
        <>
          <SectionList
            contentContainerStyle={styles.listContainer}
            sections={groupHistoryByDate(searchText ? searchResults : history)}
            keyExtractor={(item, index) => 'history' + index}
            renderSectionHeader={({ section: { date } }) => (
              <Text style={[styles.dateHeader, { color: theme.onSurface }]}>
                {dayjs(date).calendar()}
              </Text>
            )}
            renderItem={({ item }) => (
              <HistoryCard
                history={item}
                navigation={navigation}
                handleRemoveFromHistory={removeChapterFromHistory}
                theme={theme}
              />
            )}
            ListEmptyComponent={
              <EmptyView
                icon="(˘･_･˘)"
                description={getString('historyScreen.nothingReadRecently')}
                theme={theme}
              />
            }
          />
          <Portal>
            <ClearHistoryDialog
              visible={clearHistoryDialogVisible}
              onSubmit={clearAllHistory}
              onDismiss={closeClearHistoryDialog}
              theme={theme}
            />
          </Portal>
        </>
      )}
    </>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
