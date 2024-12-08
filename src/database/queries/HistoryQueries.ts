import { History } from '@database/types';

import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import { db } from '@database/db';

export const getHistoryFromDb = () =>
  db.getAllAsync<History>(`
    SELECT 
      Chapter.*, Novel.pluginId, Novel.name as novelName, Novel.path as novelPath, Novel.cover as novelCover, Novel.id as novelId
    FROM Chapter 
    JOIN Novel
    ON Chapter.novelId = Novel.id AND Chapter.readTime IS NOT NULL
    GROUP BY novelId
    HAVING readTime = MAX(readTime)
    ORDER BY readTime DESC
    `);

export const insertHistory = async (chapterId: number) =>
  db.runAsync(
    "UPDATE Chapter SET readTime = datetime('now','localtime') WHERE id = ?",
    chapterId,
  );

export const deleteChapterHistory = (chapterId: number) =>
  db.runAsync('UPDATE Chapter SET readTime = NULL WHERE id = ?', chapterId);

export const deleteAllHistory = async () => {
  await db.execAsync('UPDATE Chapter SET readTime = NULL');
  showToast(getString('historyScreen.deleted'));
};
