import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import {
  getLibraryNovelsFromDb,
  getLibraryWithCategory,
} from '@database/queries/LibraryQueries';

import { Category, LibraryNovelInfo, NovelInfo } from '@database/types';

import { useLibrarySettings } from '@hooks/persisted';
import { LibrarySortOrder } from '../constants/constants';

type Library = Category & { novels: LibraryNovelInfo[] };

export const useLibrary = ({ searchText }: { searchText?: string }) => {
  const {
    filter,
    sortOrderId = 0,
    downloadedOnlyMode = false,
  } = useLibrarySettings();

  const [library, setLibrary] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLibrary = async () => {
    if (searchText) {
      setIsLoading(true);
    }

    const [categories, novels] = await Promise.all([
      getCategoriesFromDb(),
      getLibraryWithCategory({
        searchText,
        filter,
        downloadedOnlyMode,
      }),
    ]);

    const res = categories.map(category => ({
      ...category,
      novels: novels
        .filter(novel => novel.category === category.name)
        .sort(
          sortNovelsBy(
            category.sortContents || LibrarySortOrder.DateAdded_DESC,
          ),
        ),
    }));

    setLibrary(res);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, [searchText, filter, sortOrderId, downloadedOnlyMode]),
  );

  return { library, isLoading, refetchLibrary: getLibrary };
};

export const useLibraryNovels = () => {
  const [library, setLibrary] = useState<NovelInfo[]>([]);

  const getLibrary = async () => {
    const novels = await getLibraryNovelsFromDb();

    setLibrary(novels);
  };

  useFocusEffect(
    useCallback(() => {
      getLibrary();
    }, []),
  );

  return { library, setLibrary };
};

function sortNovelsBy(order: LibrarySortOrder) {
  const [field, direction] = order.split(' ');
  const isAsc = direction === 'ASC';

  return (n1: LibraryNovelInfo, n2: LibraryNovelInfo) => {
    // @ts-ignore
    let d1 = n1[field];
    // @ts-ignore
    let d2 = n2[field];

    if (order == LibrarySortOrder.RANDOM) {
      d1 = Math.random();
      d2 = Math.random();
    }

    if (!isAsc) {
      [d1, d2] = [d2, d1];
    }

    if (typeof d1 === 'string') {
      return d1.localeCompare(d2);
    }

    return d1 - d2;
  };
}
