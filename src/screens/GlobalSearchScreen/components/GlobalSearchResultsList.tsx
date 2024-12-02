import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import color from 'color';

import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';

import { getString } from '@strings/translations';
import { useTheme } from '@hooks/persisted';

import { GlobalSearchResult } from '../hooks/useGlobalSearch';
import GlobalSearchNovelItem from './GlobalSearchNovelItem';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { LibraryNovelInfo } from '@database/types';
import { switchNovelToLibrary } from '@database/queries/NovelQueries';
import GlobalSearchSkeletonLoading from '@screens/browse/loadingAnimation/GlobalSearchSkeletonLoading';
import { interpolateColor } from 'react-native-reanimated';

interface GlobalSearchResultsListProps {
  searchResults: GlobalSearchResult[];
  ListEmptyComponent?: JSX.Element;
}

const GlobalSearchResultsList: React.FC<GlobalSearchResultsListProps> = ({
  searchResults,
  ListEmptyComponent,
}) => {
  const keyExtractor = useCallback(
    (item: GlobalSearchResult) => item.plugin.id,
    [],
  );

  return (
    <FlatList<GlobalSearchResult>
      keyExtractor={keyExtractor}
      data={searchResults}
      contentContainerStyle={styles.resultList}
      renderItem={({ item }) => <GlobalSearchSourceResults item={item} />}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

const GlobalSearchSourceResults: React.FC<{ item: GlobalSearchResult }> = ({
  item,
}) => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { library, setLibrary } = useLibraryNovels();

  const novelInLibrary = (pluginId: string, novelPath: string) =>
    library?.some(
      novel => novel.pluginId === pluginId && novel.path === novelPath,
    );

  const errorColor = theme.isDark ? '#B3261E' : '#F2B8B5';
  const noResultsColor = interpolateColor(
    0.8,
    [0, 1],
    ['transparent', theme.onSurfaceVariant],
  );

  const navigateToNovel = useCallback(
    (item: { name: string; path: string; pluginId: string }) =>
      navigation.push('Novel', item),
    [],
  );

  return useMemo(
    () => (
      <>
        <View>
          <Pressable
            android_ripple={{
              color: color(theme.primary).alpha(0.12).string(),
            }}
            style={styles.sourceHeader}
            onPress={() =>
              navigation.navigate('SourceScreen', {
                pluginId: item.plugin.id,
                pluginName: item.plugin.name,
                site: item.plugin.site,
              })
            }
          >
            <View>
              <Text style={[styles.sourceName, { color: theme.onSurface }]}>
                {item.plugin.name}
              </Text>
              <Text
                style={[styles.language, { color: theme.onSurfaceVariant }]}
              >
                {item.plugin.lang}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="arrow-right"
              size={24}
              color={theme.onSurface}
            />
          </Pressable>
          {item.isLoading ? (
            <GlobalSearchSkeletonLoading theme={theme} />
          ) : item.error ? (
            <Text style={[styles.error, { color: errorColor }]}>
              {item.error}
            </Text>
          ) : (
            <FlatList
              horizontal
              contentContainerStyle={styles.novelsContainer}
              keyExtractor={novelItem => item.plugin.id + '_' + novelItem.path}
              data={item.novels}
              ListEmptyComponent={
                <Text style={[styles.listEmpty, { color: noResultsColor }]}>
                  {getString('sourceScreen.noResultsFound')}
                </Text>
              }
              renderItem={({ item: novelItem }) => {
                const inLibrary = novelInLibrary(
                  item.plugin.id,
                  novelItem.path,
                );

                return (
                  <GlobalSearchNovelItem
                    novel={novelItem}
                    pluginId={item.plugin.id}
                    inLibrary={inLibrary}
                    navigateToNovel={navigateToNovel}
                    theme={theme}
                    onLongPress={() => {
                      setLibrary(prevValues => {
                        if (inLibrary) {
                          return [
                            ...prevValues.filter(
                              novel => novel.path !== novelItem.path,
                            ),
                          ];
                        } else {
                          return [
                            ...prevValues,
                            {
                              path: novelItem.path,
                            } as LibraryNovelInfo,
                          ];
                        }
                      });
                      switchNovelToLibrary(novelItem.path, item.plugin.id);
                    }}
                  />
                );
              }}
            />
          )}
        </View>
      </>
    ),
    [item.isLoading],
  );
};

export default GlobalSearchResultsList;

const styles = StyleSheet.create({
  resultList: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 60,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  sourceName: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  language: {
    fontSize: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  error: {
    padding: 16,
    marginBottom: 16,
  },
  novelsContainer: {
    padding: 8,
  },
  listEmpty: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
