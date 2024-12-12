import React, { memo, Suspense, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { RefreshControl, SectionList, StyleSheet, Text } from 'react-native';

import { EmptyView, ErrorScreenV2, SearchbarV2 } from '@components';

import { useSearch } from '@hooks';
import { useUpdates } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { useTheme } from '@hooks/persisted';
import UpdatesSkeletonLoading from './components/UpdatesSkeletonLoading';
import UpdateNovelCard from './components/UpdateNovelCard';
import { useFocusEffect } from '@react-navigation/native';
import { deleteChapter } from '@database/queries/ChapterQueries';
import { showToast } from '@utils/showToast';
import ServiceManager from '@services/ServiceManager';
import { UpdateScreenProps } from '@navigators/types';

const UpdatesScreen = ({ navigation }: UpdateScreenProps) => {
  const theme = useTheme();
  const {
    isLoading,
    updatesOverview,
    getUpdates,
    lastUpdateTime,
    showLastUpdateTime,
    error,
  } = useUpdates();
  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const onChangeText = (text: string) => {
    setSearchText(text);
  };

  useFocusEffect(
    useCallback(() => {
      //? Push updates to the end of the stack to avoid lag
      setTimeout(() => {
        getUpdates();
      }, 0);
    }, []),
  );

  useEffect(
    () =>
      navigation.addListener('tabPress', e => {
        if (navigation.isFocused()) {
          e.preventDefault();

          navigation.navigate('MoreStack', {
            screen: 'Downloads',
          });
        }
      }),
    [navigation],
  );

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        clearSearchbar={clearSearchbar}
        placeholder={getString('updatesScreen.searchbar')}
        onChangeText={onChangeText}
        leftIcon="magnify"
        theme={theme}
        rightIcons={[
          {
            iconName: 'reload',
            onPress: () =>
              ServiceManager.manager.addTask({ name: 'UPDATE_LIBRARY' }),
          },
        ]}
      />
      {isLoading && updatesOverview.length === 0 ? (
        <UpdatesSkeletonLoading theme={theme} />
      ) : error ? (
        <ErrorScreenV2 error={error} />
      ) : (
        <Suspense fallback={<UpdatesSkeletonLoading theme={theme} />}>
          <SectionList
            extraData={[updatesOverview.length]}
            ListHeaderComponent={
              showLastUpdateTime && lastUpdateTime ? (
                <LastUpdateTime lastUpdateTime={lastUpdateTime} theme={theme} />
              ) : null
            }
            contentContainerStyle={styles.listContainer}
            renderSectionHeader={({ section: { date } }) => (
              <Text style={[styles.dateHeader, { color: theme.onSurface }]}>
                {dayjs(date).calendar()}
              </Text>
            )}
            sections={updatesOverview
              .filter(v =>
                searchText
                  ? v.novelName.toLowerCase().includes(searchText.toLowerCase())
                  : true,
              )
              .map(v => {
                return { data: [v], date: v.updateDate };
              })}
            keyExtractor={item => 'updatedGroup' + item.novelId}
            renderItem={({ item }) => (
              <Suspense fallback={<UpdatesSkeletonLoading theme={theme} />}>
                <UpdateNovelCard
                  deleteChapter={chapter => {
                    deleteChapter(
                      chapter.pluginId,
                      chapter.novelId,
                      chapter.id,
                    ).then(() => {
                      showToast(
                        getString('common.deleted', {
                          name: chapter.name,
                        }),
                      );
                      getUpdates();
                    });
                  }}
                  chapterListInfo={item}
                  descriptionText={getString('updatesScreen.updatesLower')}
                />
              </Suspense>
            )}
            ListEmptyComponent={
              <EmptyView
                icon="(˘･_･˘)"
                description={getString('updatesScreen.emptyView')}
                theme={theme}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() =>
                  ServiceManager.manager.addTask({ name: 'UPDATE_LIBRARY' })
                }
                colors={[theme.onPrimary]}
                progressBackgroundColor={theme.primary}
              />
            }
          />
        </Suspense>
      )}
    </>
  );
};

export default memo(UpdatesScreen);

const LastUpdateTime: React.FC<{
  lastUpdateTime: Date | number | string;
  theme: ThemeColors;
}> = ({ lastUpdateTime, theme }) => (
  <Text style={[styles.lastUpdateTime, { color: theme.onSurface }]}>
    {`${getString('updatesScreen.lastUpdatedAt')} ${dayjs(
      lastUpdateTime,
    ).fromNow()}`}
  </Text>
);

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  dateHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  lastUpdateTime: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
