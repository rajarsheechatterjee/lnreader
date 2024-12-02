import * as SQLite from 'expo-sqlite';
import {showToast} from '@utils/showToast';
import {ChapterInfo, DownloadedChapter} from '../types';
import {ChapterItem} from '@plugins/types';

import {getAllTransaction, runTransaction} from '@database/utils/helpers';
import {Update} from '../types';
import {getString} from '@strings/translations';
import FileManager from '@native/FileManager';
import {NOVEL_STORAGE} from '@utils/Storages';

const db = SQLite.openDatabaseSync('lnreader.db');
const insertChapterQuery = `
INSERT OR IGNORE INTO Chapter (path, name, releaseTime, novelId, chapterNumber, page, position)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export const insertChapters = async (
  novelId: number,
  chapters?: ChapterItem[],
) => {
  if (!chapters?.length) {
    return;
  }
  db.withTransactionAsync(async () => {
    chapters.forEach((chapter, index) => {
      db.runAsync(insertChapterQuery, [
        chapter.path,
        chapter.name,
        chapter.releaseTime || '',
        novelId,
        chapter.chapterNumber || null,
        chapter.page || '1',
        index,
      ]).then(data => {
        if (!data.lastInsertRowId || data.lastInsertRowId < 0) {
          db.runAsync(
            `
              UPDATE Chapter SET
                page = ?, position = ?
              WHERE path = ? AND novelId = ? AND (page != ? OR position != ?)
            `,
            [
              chapter.page || '1',
              index,
              chapter.path,
              novelId,
              chapter.page || '1',
              index,
            ],
          );
        }
      });
    });
  });
};

const getPageChaptersQuery = (sort = 'ORDER BY position ASC', filter = '') =>
  `SELECT * FROM Chapter WHERE novelId = ? AND page = ? ${filter} ${sort}`;

export const getCustomPages = (novelId: number): Promise<{page: string}[]> => {
  return getAllTransaction(db, [
    ['SELECT DISTINCT page from Chapter WHERE novelId = ?', [novelId]],
  ]) as any;
};

export const getNovelChapters = (novelId: number): Promise<ChapterInfo[]> => {
  return getAllTransaction(db, [
    ['SELECT * FROM Chapter WHERE novelId = ?', [novelId]],
  ]) as any;
};

export const getChapter = async (
  chapterId: number,
): Promise<ChapterInfo | null> => {
  return getAllTransaction(db, [
    ['SELECT * FROM Chapter WHERE id = ?', [chapterId]],
  ]) as any;
};

export const getPageChapters = (
  novelId: number,
  sort?: string,
  filter?: string,
  page?: string,
): Promise<ChapterInfo[]> => {
  return getAllTransaction(db, [
    [getPageChaptersQuery(sort, filter), [novelId, page || '1']],
  ]) as any;
};

const getPrevChapterQuery = `
  SELECT
    *
  FROM
    Chapter
  WHERE
    novelId = ?
  AND
    id < ?
  `;

export const getPrevChapter = (
  novelId: number,
  chapterId: number,
): Promise<ChapterInfo | null> => {
  return getAllTransaction(db, [
    [getPrevChapterQuery, [novelId, chapterId]],
  ]) as any;
};

const getNextChapterQuery = `
  SELECT
    *
  FROM
    Chapter
  WHERE
    novelId = ?
  AND
    id > ?
  `;

export const getNextChapter = (
  novelId: number,
  chapterId: number,
): Promise<ChapterInfo | null> => {
  return getAllTransaction(db, [
    [getNextChapterQuery, [novelId, chapterId]],
  ]) as any;
};

const markChapterReadQuery = 'UPDATE Chapter SET `unread` = 0 WHERE id = ?';

export const markChapterRead = async (chapterId: number) => {
  runTransaction(db, [[markChapterReadQuery, [chapterId]]]);
};

export const markChaptersRead = async (chapterIds: number[]) => {
  runTransaction(db, [
    [`UPDATE Chapter SET \`unread\` = 0 WHERE id IN (${chapterIds.join(',')})`],
  ]);
};

const markChapterUnreadQuery = 'UPDATE Chapter SET `unread` = 1 WHERE id = ?';

export const markChapterUnread = async (chapterId: number) => {
  runTransaction(db, [[markChapterUnreadQuery, [chapterId]]]);
};

export const markChaptersUnread = async (chapterIds: number[]) => {
  runTransaction(db, [
    [`UPDATE Chapter SET \`unread\` = 1 WHERE id IN (${chapterIds.join(',')})`],
  ]);
};

const markAllChaptersReadQuery =
  'UPDATE Chapter SET `unread` = 0 WHERE novelId = ?';

export const markAllChaptersRead = async (novelId: number) => {
  runTransaction(db, [[markAllChaptersReadQuery, [novelId]]]);
};

const markAllChaptersUnreadQuery =
  'UPDATE Chapter SET `unread` = 1 WHERE novelId = ?';

export const markAllChaptersUnread = async (novelId: number) => {
  runTransaction(db, [[markAllChaptersUnreadQuery, [novelId]]]);
};

const deleteDownloadedFiles = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
) => {
  try {
    const chapterFolder = `${NOVEL_STORAGE}/${pluginId}/${novelId}/${chapterId}`;
    await FileManager.unlink(chapterFolder);
  } catch (error) {
    throw new Error(getString('novelScreen.deleteChapterError'));
  }
};

// delete downloaded chapter
export const deleteChapter = async (
  pluginId: string,
  novelId: number,
  chapterId: number,
) => {
  const updateIsDownloadedQuery =
    'UPDATE Chapter SET isDownloaded = 0 WHERE id = ?';

  await deleteDownloadedFiles(pluginId, novelId, chapterId);
  runTransaction(db, [[updateIsDownloadedQuery, [chapterId]]]);
};

export const deleteChapters = async (
  pluginId: string,
  novelId: number,
  chapters?: ChapterInfo[],
) => {
  if (!chapters?.length) {
    return;
  }

  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`;

  await Promise.all(
    chapters?.map(chapter =>
      deleteDownloadedFiles(pluginId, novelId, chapter.id),
    ),
  );
  runTransaction(db, [[updateIsDownloadedQuery]]);
};

export const deleteDownloads = async (chapters: DownloadedChapter[]) => {
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedFiles(chapter.pluginId, chapter.novelId, chapter.id);
    }),
  );
  runTransaction(db, [['UPDATE Chapter SET isDownloaded = 0']]);
};

const getReadDownloadedChapters = async (): Promise<DownloadedChapter[]> => {
  return getAllTransaction(db, [
    [
      `
        SELECT Chapter.id, Chapter.novelId, pluginId 
        FROM Chapter
        JOIN Novel
        ON Novel.id = Chapter.novelId AND unread = 0 AND isDownloaded = 1`,
    ],
  ]) as any;
};

export const deleteReadChaptersFromDb = async () => {
  const chapters = await getReadDownloadedChapters();
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedFiles(chapter.pluginId, chapter.novelId, chapter.novelId);
    }),
  );
  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();

  const updateIsDownloadedQuery = `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`;

  runTransaction(db, [[updateIsDownloadedQuery]]);
  showToast(getString('novelScreen.readChaptersDeleted'));
};

export const updateChapterProgress = async (
  chapterId: number,
  progress: number,
) => {
  runTransaction(db, [
    ['UPDATE Chapter SET progress = ? WHERE id = ?', [progress, chapterId]],
  ]);
};

export const updateChapterProgressByIds = async (
  chapterIds: number[],
  progress: number,
) => {
  runTransaction(db, [
    [
      `UPDATE Chapter SET progress = ? WHERE id in (${chapterIds.join(',')})`,
      [progress],
    ],
  ]);
};

const bookmarkChapterQuery =
  'UPDATE Chapter SET bookmark = (CASE WHEN bookmark = 0 THEN 1 ELSE 0 END) WHERE id = ?';

export const bookmarkChapter = async (chapterId: number) => {
  runTransaction(db, [[bookmarkChapterQuery, [chapterId]]]);
};

const markPreviuschaptersReadQuery =
  'UPDATE Chapter SET `unread` = 0 WHERE id <= ? AND novelId = ?';

export const markPreviuschaptersRead = async (
  chapterId: number,
  novelId: number,
) => {
  runTransaction(db, [[markPreviuschaptersReadQuery, [chapterId, novelId]]]);
};

const markPreviousChaptersUnreadQuery =
  'UPDATE Chapter SET `unread` = 1 WHERE id <= ? AND novelId = ?';

export const markPreviousChaptersUnread = async (
  chapterId: number,
  novelId: number,
) => {
  runTransaction(db, [[markPreviousChaptersUnreadQuery, [chapterId, novelId]]]);
};

const getDownloadedChaptersQuery = `
    SELECT
      Chapter.*,
      Novel.pluginId, Novel.name as novelName, Novel.cover as novelCover, Novel.path as novelPath
    FROM Chapter
    JOIN Novel
    ON Chapter.novelId = Novel.id
    WHERE Chapter.isDownloaded = 1
  `;

export const getDownloadedChapters = (): Promise<DownloadedChapter[]> => {
  return getAllTransaction(db, [[getDownloadedChaptersQuery]]) as any;
};

const getUpdatesQuery = `
SELECT
  Chapter.*,
  pluginId, Novel.id as novelId, Novel.name as novelName, Novel.path as novelPath, cover as novelCover
FROM
  Chapter
JOIN
  Novel
ON Chapter.novelId = Novel.id AND Chapter.updatedTime IS NOT NULL
ORDER BY Chapter.updatedTime DESC
`;

export const getUpdatesFromDb = (): Promise<Update[]> => {
  return getAllTransaction(db, [[getUpdatesQuery]]) as any;
};

export const clearUpdates = () => {
  runTransaction(db, [['UPDATE Chapter SET updatedTime = NULL']]);
};
