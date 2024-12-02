import * as SQLite from 'expo-sqlite';
import {countBy} from 'lodash-es';
import {LibraryStats} from '../types';
import {getAllTransaction, getFirstTransaction} from '../utils/helpers';

const db = SQLite.openDatabaseSync('lnreader.db');

const getLibraryStatsQuery = `
  SELECT COUNT(*) as novelsCount, COUNT(DISTINCT pluginId) as sourcesCount
  FROM Novel
  WHERE inLibrary = 1
  `;

const getChaptersReadCountQuery = `
  SELECT COUNT(*) as chaptersRead
  FROM Chapter
  JOIN Novel
  ON Chapter.novelId = Novel.id
  WHERE Chapter.unread = 0 AND Novel.inLibrary = 1
  `;

const getChaptersTotalCountQuery = `
  SELECT COUNT(*) as chaptersCount
  FROM Chapter
  JOIN Novel
  ON Chapter.novelId = Novel.id
  WHERE Novel.inLibrary = 1
  `;

const getChaptersUnreadCountQuery = `
  SELECT COUNT(*) as chaptersUnread
  FROM Chapter
  JOIN Novel
  ON Chapter.novelId = Novel.id
  WHERE Chapter.unread = 1 AND Novel.inLibrary = 1
  `;

const getChaptersDownloadedCountQuery = `
  SELECT COUNT(*) as chaptersDownloaded
  FROM Chapter
  JOIN Novel
  ON Chapter.novelId = Novel.id
  WHERE Chapter.isDownloaded = 1 AND Novel.inLibrary = 1
  `;

const getNovelGenresQuery = `
  SELECT genres
  FROM Novel
  WHERE Novel.inLibrary = 1
  `;

const getNovelStatusQuery = `
  SELECT status
  FROM Novel
  WHERE Novel.inLibrary = 1
  `;

export const getLibraryStatsFromDb = async (): Promise<LibraryStats> => {
  return getFirstTransaction(db, [[getLibraryStatsQuery]]) as any;
};

export const getChaptersTotalCountFromDb = async (): Promise<LibraryStats> => {
  return getFirstTransaction(db, [[getChaptersTotalCountQuery]]) as any;
};

export const getChaptersReadCountFromDb = async (): Promise<LibraryStats> => {
  return getFirstTransaction(db, [[getChaptersReadCountQuery]]) as any;
};

export const getChaptersUnreadCountFromDb = async (): Promise<LibraryStats> => {
  return getFirstTransaction(db, [[getChaptersUnreadCountQuery]]) as any;
};

export const getChaptersDownloadedCountFromDb =
  async (): Promise<LibraryStats> => {
    return getFirstTransaction(db, [[getChaptersDownloadedCountQuery]]) as any;
  };

export const getNovelGenresFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    getAllTransaction(db, [[getNovelGenresQuery]]).then(res => {
      let genres: string[] = [];

      (res as any).forEach((item: {genres: string}) => {
        const novelGenres = item.genres?.split(/\s*,\s*/);

        if (novelGenres?.length) {
          genres.push(...novelGenres);
        }
      });

      resolve({genres: countBy(genres)});
    });
  });
};

export const getNovelStatusFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    getAllTransaction(db, [[getNovelGenresQuery]]).then(res => {
      let status: string[] = [];

      (res as any).forEach((item: {genres: string}) => {
        const novelGenres = item.genres?.split(/\s*,\s*/);

        if (novelGenres?.length) {
          status.push(...novelGenres);
        }
      });

      resolve({status: countBy(status)});
    });
  });
};
