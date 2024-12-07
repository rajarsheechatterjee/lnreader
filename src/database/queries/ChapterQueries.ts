import { showToast } from '@utils/showToast';
import { ChapterInfo, DownloadedChapter } from '../types';
import { ChapterItem } from '@plugins/types';

import { Update } from '../types';
import { getString } from '@strings/translations';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import { db } from '@database/db';

export const insertChapters = async (
  novelId: number,
  chapters?: ChapterItem[],
) => {
  if (!chapters?.length) {
    return;
  }
  return db.withTransactionAsync(async () => {
    const existedPaths = db
      .getAllSync<{ path: string }>(
        'SELECT path FROM Chapter WHERE novelId = ?',
        novelId,
      )
      .map(res => res.path);
    chapters.forEach((chapter, index) => {
      if (existedPaths.includes(chapter.path)) {
        db.runSync(
          `
            UPDATE Chapter SET
              page = ?, position = ?
            WHERE path = ? AND novelId = ? AND (page != ? OR position != ?)
          `,
          chapter.page || '1',
          index,
          chapter.path,
          novelId,
          chapter.page || '1',
          index,
        );
      } else {
        db.runSync(
          'INSERT INTO Chapter (path, name, releaseTime, novelId, chapterNumber, page, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
          chapter.path,
          chapter.name,
          chapter.releaseTime || '',
          novelId,
          chapter.chapterNumber || null,
          chapter.page || '1',
          index,
        );
      }
    });
  });
};

export const getCustomPages = (novelId: number) =>
  db.getAllAsync<{ page: string }>(
    'SELECT DISTINCT page from Chapter WHERE novelId = ?',
    novelId,
  );

export const getNovelChapters = (novelId: number) =>
  db.getAllAsync<ChapterInfo>(
    'SELECT * FROM Chapter WHERE novelId = ?',
    novelId,
  );

export const getChapter = (chapterId: number) =>
  db.getFirstAsync<ChapterInfo>(
    'SELECT * FROM Chapter WHERE id = ?',
    chapterId,
  );

const getPageChaptersQuery = (sort = 'ORDER BY position ASC', filter = '') =>
  `SELECT * FROM Chapter WHERE novelId = ? AND page = ? ${filter} ${sort}`;

export const getPageChapters = (
  novelId: number,
  sort?: string,
  filter?: string,
  page?: string,
) =>
  db.getAllAsync<ChapterInfo>(
    getPageChaptersQuery(sort, filter),
    novelId,
    page || '1',
  );

export const getPrevChapter = (novelId: number, chapterId: number) =>
  db.getFirstAsync<ChapterInfo>(
    'SELECT * FROM Chapter WHERE novelId = ? AND id < ?',
    novelId,
    chapterId,
  );

export const getNextChapter = (novelId: number, chapterId: number) =>
  db.getFirstAsync<ChapterInfo>(
    'SELECT * FROM Chapter WHERE novelId = ? AND id > ?',
    novelId,
    chapterId,
  );

export const markChapterRead = (chapterId: number) =>
  db.runAsync('UPDATE Chapter SET `unread` = 0 WHERE id = ?', chapterId);

export const markChaptersRead = (chapterIds: number[]) =>
  db.execAsync(
    `UPDATE Chapter SET \`unread\` = 0 WHERE id IN (${chapterIds.join(',')})`,
  );

export const markChapterUnread = (chapterId: number) =>
  db.runAsync('UPDATE Chapter SET `unread` = 1 WHERE id = ?', chapterId);

export const markChaptersUnread = (chapterIds: number[]) =>
  db.execAsync(
    `UPDATE Chapter SET \`unread\` = 1 WHERE id IN (${chapterIds.join(',')})`,
  );

export const markAllChaptersRead = (novelId: number) =>
  db.runAsync('UPDATE Chapter SET `unread` = 0 WHERE novelId = ?', novelId);

export const markAllChaptersUnread = (novelId: number) =>
  db.runAsync('UPDATE Chapter SET `unread` = 1 WHERE novelId = ?', novelId);

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
  await deleteDownloadedFiles(pluginId, novelId, chapterId);
  await db.runAsync(
    'UPDATE Chapter SET isDownloaded = 0 WHERE id = ?',
    chapterId,
  );
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

  await Promise.all(
    chapters?.map(chapter =>
      deleteDownloadedFiles(pluginId, novelId, chapter.id),
    ),
  );
  await db.execAsync(
    `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`,
  );
};

export const deleteDownloads = async (chapters: DownloadedChapter[]) => {
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedFiles(chapter.pluginId, chapter.novelId, chapter.id);
    }),
  );
  await db.execAsync('UPDATE Chapter SET isDownloaded = 0');
};

const getReadDownloadedChapters = () =>
  db.getAllAsync<DownloadedChapter>(`
        SELECT Chapter.id, Chapter.novelId, pluginId 
        FROM Chapter
        JOIN Novel
        ON Novel.id = Chapter.novelId AND unread = 0 AND isDownloaded = 1`);

export const deleteReadChaptersFromDb = async () => {
  const chapters = await getReadDownloadedChapters();
  await Promise.all(
    chapters?.map(chapter => {
      deleteDownloadedFiles(chapter.pluginId, chapter.novelId, chapter.novelId);
    }),
  );
  const chapterIdsString = chapters?.map(chapter => chapter.id).toString();
  db.execAsync(
    `UPDATE Chapter SET isDownloaded = 0 WHERE id IN (${chapterIdsString})`,
  );
  showToast(getString('novelScreen.readChaptersDeleted'));
};

export const updateChapterProgress = (chapterId: number, progress: number) =>
  db.runAsync(
    'UPDATE Chapter SET progress = ? WHERE id = ?',
    progress,
    chapterId,
  );

export const updateChapterProgressByIds = (
  chapterIds: number[],
  progress: number,
) =>
  db.runAsync(
    `UPDATE Chapter SET progress = ? WHERE id in (${chapterIds.join(',')})`,
    progress,
  );

export const bookmarkChapter = (chapterId: number) =>
  db.runAsync(
    'UPDATE Chapter SET bookmark = (CASE WHEN bookmark = 0 THEN 1 ELSE 0 END) WHERE id = ?',
    chapterId,
  );

export const markPreviuschaptersRead = (chapterId: number, novelId: number) =>
  db.runAsync(
    'UPDATE Chapter SET `unread` = 0 WHERE id <= ? AND novelId = ?',
    chapterId,
    novelId,
  );

export const markPreviousChaptersUnread = (
  chapterId: number,
  novelId: number,
) =>
  db.runAsync(
    'UPDATE Chapter SET `unread` = 1 WHERE id <= ? AND novelId = ?',
    chapterId,
    novelId,
  );

export const getDownloadedChapters = () =>
  db.getAllAsync<DownloadedChapter>(`
    SELECT
      Chapter.*,
      Novel.pluginId, Novel.name as novelName, Novel.cover as novelCover, Novel.path as novelPath
    FROM Chapter
    JOIN Novel
    ON Chapter.novelId = Novel.id
    WHERE Chapter.isDownloaded = 1
  `);

export const getUpdatesFromDb = () =>
  db.getAllAsync<Update>(`
SELECT
  Chapter.*,
  pluginId, Novel.id as novelId, Novel.name as novelName, Novel.path as novelPath, cover as novelCover
FROM
  Chapter
JOIN
  Novel
ON Chapter.novelId = Novel.id AND Chapter.updatedTime IS NOT NULL
ORDER BY Chapter.updatedTime DESC
`);

export const clearUpdates = () =>
  db.execAsync('UPDATE Chapter SET updatedTime = NULL');
