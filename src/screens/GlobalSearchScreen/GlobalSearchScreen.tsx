import React from 'react';

import { ProgressBar } from 'react-native-paper';

import { EmptyView, SearchbarV2 } from '@components/index';
import GlobalSearchResultsList from './components/GlobalSearchResultsList';

import { useSearch } from '@hooks';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';
import { useGlobalSearch } from './hooks/useGlobalSearch';

interface Props {
  route?: {
    params?: {
      searchText?: string;
    };
  };
}

const GlobalSearchScreen = (props: Props) => {
  const theme = useTheme();
  const { searchText, setSearchText, clearSearchbar } = useSearch(
    props?.route?.params?.searchText,
    false,
  );
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => globalSearch(searchText);

  const { searchResults, globalSearch, progress } = useGlobalSearch({
    defaultSearchText: searchText,
  });

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        placeholder={getString('browseScreen.globalSearch')}
        leftIcon="magnify"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={clearSearchbar}
        theme={theme}
      />
      {progress ? (
        <ProgressBar
          color={theme.primary}
          progress={Math.round(1000 * progress) / 1000}
        />
      ) : null}
      <GlobalSearchResultsList
        searchResults={searchResults}
        ListEmptyComponent={
          <EmptyView
            icon="__φ(．．)"
            description={`${getString('globalSearch.searchIn')} ${getString(
              'globalSearch.allSources',
            )}`}
            theme={theme}
          />
        }
      />
    </>
  );
};

export default GlobalSearchScreen;
