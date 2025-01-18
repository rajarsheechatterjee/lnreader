import { LibraryFilter } from '@screens/library/constants/constants';
import { LibraryNovelInfo, NovelInfo } from '../types';
import { txnErrorCallback } from '../utils/helpers';
import { db } from '@database/db';

export const getNovelsWithCategory = (
  categoryId: number,
  onlyOngoingNovels?: boolean,
): Promise<NovelInfo[]> => {
  let query = `
    SELECT
    * 
    FROM Novel
    JOIN (
        SELECT novelId 
            FROM NovelCategory WHERE categoryId = ?
      ) as NC
    ON Novel.id = NC.novelId
  `;
  if (onlyOngoingNovels) {
    query += " AND status NOT LIKE 'Completed'";
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        query,
        [categoryId],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const getLibraryNovelsFromDb = (
  onlyOngoingNovels?: boolean,
): Promise<NovelInfo[]> => {
  let getLibraryNovelsQuery = 'SELECT * FROM Novel WHERE inLibrary = 1';

  if (onlyOngoingNovels) {
    getLibraryNovelsQuery += " AND status = 'Ongoing'";
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getLibraryNovelsQuery,
        undefined,
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

const getLibraryWithCategoryQuery = `
  SELECT *
  FROM
  (
    SELECT NIL.*, chaptersUnread, chaptersDownloaded, lastReadAt, lastUpdatedAt
    FROM 
    (
      SELECT 
        Novel.*,
        category,
        categoryId
      FROM
      Novel LEFT JOIN (
        SELECT NovelId, name as category, categoryId FROM (NovelCategory JOIN Category ON NovelCategory.categoryId = Category.id)
      ) as NC ON Novel.id = NC.novelId
      WHERE inLibrary = 1
    ) as NIL 
    LEFT JOIN 
    (
      SELECT 
        SUM(unread) as chaptersUnread, SUM(isDownloaded) as chaptersDownloaded, 
        novelId, MAX(readTime) as lastReadAt, MAX(updatedTime) as lastUpdatedAt
      FROM Chapter
      WHERE hidden = 0
      GROUP BY novelId
    ) as C ON NIL.id = C.novelId
  ) WHERE 1 = 1 
`;

export const getLibraryWithCategory = ({
  filter,
  searchText,
  sortOrder,
  downloadedOnlyMode,
}: {
  sortOrder?: string;
  filter?: string;
  searchText?: string;
  downloadedOnlyMode?: boolean;
}): Promise<LibraryNovelInfo[]> => {
  let query = getLibraryWithCategoryQuery;
  let preparedArgument: (string | number | null)[] = [];

  if (filter) {
    query += ` AND ${filter} `;
  }
  if (downloadedOnlyMode) {
    query += ' ' + LibraryFilter.DownloadedOnly;
  }

  if (searchText) {
    query += ' AND name LIKE ? ';
    preparedArgument.push(`%${searchText}%`);
  }

  if (sortOrder) {
    query += ` ORDER BY ${sortOrder} `;
  }

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        query,
        preparedArgument,
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};
