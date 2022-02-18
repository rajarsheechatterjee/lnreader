import React, {useRef} from 'react';
import {StyleSheet, RefreshControl} from 'react-native';
import {Portal} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {
  ErrorScreen,
  LoadingScreen,
  NovelCover,
  NovelList,
  Searchbar,
  EmptyView,
} from '../../components';
import LibraryBottomSheet from './components/LibraryBottomSheet/LibraryBottomSheet';

import useLibrary from './hooks/useLibrary';
import {useLibrarySettings, useTheme} from '../../redux/hooks';
import {useSearch} from '../../hooks';
import useLibraryUpdate from '../UpdatesScreen/hooks/useLibraryUpdate';
import {getFilterColor} from '../../theme/utils/colorUtils';

const LibraryScreen = () => {
  const theme = useTheme();
  const {navigate} = useNavigation();

  const {
    isLoading,
    novels,
    getLibrarySearchResults,
    clearSearchResults,
    error,
  } = useLibrary();

  const {filters} = useLibrarySettings();

  const {isUpdating, updateLibrary} = useLibraryUpdate();

  let bottomSheetRef = useRef<any>(null);
  const expandBottomSheet = () => bottomSheetRef.current.show();

  const {searchText, setSearchText, clearSearchbar} = useSearch();
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  const onChangeText = (text: string) => {
    setSearchText(text);
    getLibrarySearchResults(text);
  };

  return isLoading ? (
    <LoadingScreen theme={theme} />
  ) : error ? (
    <ErrorScreen error={error} theme={theme} />
  ) : (
    <>
      <Searchbar
        searchText={searchText}
        placeholder="Search library"
        leftIcon="magnify"
        onChangeText={onChangeText}
        clearSearchbar={handleClearSearchbar}
        rightIcons={[
          {
            iconName: 'filter-variant',
            onPress: expandBottomSheet,
            color:
              filters.length > 0
                ? getFilterColor(theme)
                : theme.textColorPrimary,
          },
        ]}
        theme={theme}
      />
      <NovelList
        data={novels}
        keyExtractor={item => `${item.novelUrl}${item.sourceId}`}
        renderItem={({item}) => (
          <NovelCover
            item={item}
            theme={theme}
            onPress={() => navigate('NovelScreen' as never, {...item} as never)}
          />
        )}
        ListEmptyComponent={
          <EmptyView
            icon="Σ(ಠ_ಠ)"
            description="Your library is empty. Add series to your library from Browse."
            theme={theme}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isUpdating}
            onRefresh={updateLibrary}
            colors={[theme.onPrimary]}
            progressBackgroundColor={theme.primary}
          />
        }
      />
      <Portal>
        <LibraryBottomSheet bottomSheetRef={bottomSheetRef} theme={theme} />
      </Portal>
    </>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({});
