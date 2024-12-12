import { LibraryFilter } from '@screens/library/constants/constants';
import { LibraryNovelInfo, NovelInfo } from '../types';
import { getAllSync } from '../utils/helpers';
import { db } from '@database/db';

export const getLibraryNovelsFromDb = (
  onlyOngoingNovels?: boolean,
): NovelInfo[] => {
  let getLibraryNovelsQuery = 'SELECT * FROM Novel WHERE inLibrary = 1';

  if (onlyOngoingNovels) {
    getLibraryNovelsQuery += " AND status = 'Ongoing'";
  }
  return getAllSync<NovelInfo>(db, [[getLibraryNovelsQuery]]) ?? [];
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
}): LibraryNovelInfo[] => {
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
  return getAllSync<LibraryNovelInfo>(db, [[query, preparedArgument]]) ?? [];
};
