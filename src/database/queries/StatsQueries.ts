import { countBy } from 'lodash-es';
import { LibraryStats } from '../types';
import { txnErrorCallback } from '../utils/helpers';
import { db } from '@database/db';

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
  WHERE Chapter.unread = 0 AND Novel.inLibrary = 1 AND Chapter.hidden = 0
  `;

const getChaptersTotalCountQuery = `
  SELECT COUNT(*) as chaptersCount
  FROM Chapter
  JOIN Novel
  ON Chapter.novelId = Novel.id
  WHERE Novel.inLibrary = 1 AND Chapter.hidden = 0
  `;

const getChaptersUnreadCountQuery = `
  SELECT COUNT(*) as chaptersUnread
  FROM Chapter
  JOIN Novel
  ON Chapter.novelId = Novel.id
  WHERE Chapter.unread = 1 AND Novel.inLibrary = 1 AND Chapter.hidden = 0
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
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getLibraryStatsQuery,
        undefined,
        (txObj, { rows }) => {
          resolve((rows as any)._array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersTotalCountFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getChaptersTotalCountQuery,
        undefined,
        (txObj, { rows }) => {
          resolve((rows as any)._array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersReadCountFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getChaptersReadCountQuery,
        undefined,
        (txObj, { rows }) => {
          resolve((rows as any)._array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersUnreadCountFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getChaptersUnreadCountQuery,
        undefined,
        (txObj, { rows }) => {
          resolve((rows as any)._array[0]);
        },
        txnErrorCallback,
      );
    });
  });
};

export const getChaptersDownloadedCountFromDb =
  async (): Promise<LibraryStats> => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          getChaptersDownloadedCountQuery,
          undefined,
          (txObj, { rows }) => {
            resolve((rows as any)._array[0]);
          },
          txnErrorCallback,
        );
      });
    });
  };

export const getNovelGenresFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getNovelGenresQuery,
        undefined,
        (txObj, { rows }) => {
          let genres: string[] = [];

          (rows as any)._array.forEach((item: { genres: string }) => {
            const novelGenres = item.genres?.split(/\s*,\s*/);

            if (novelGenres?.length) {
              genres.push(...novelGenres);
            }
          });

          resolve({ genres: countBy(genres) });
        },
        txnErrorCallback,
      );
    });
  });
};

export const getNovelStatusFromDb = async (): Promise<LibraryStats> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getNovelStatusQuery,
        undefined,
        (txObj, { rows }) => {
          let status: string[] = [];

          (rows as any)._array.forEach((item: { status: string }) => {
            status.push(item.status);
          });

          resolve({ status: countBy(status) });
        },
        txnErrorCallback,
      );
    });
  });
};
