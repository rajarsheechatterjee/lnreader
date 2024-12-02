import {History} from '@database/types';
import {getAllTransaction, runTransaction} from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('lnreader.db');

import {showToast} from '../../utils/showToast';
import {getString} from '@strings/translations';

const getHistoryQuery = `
    SELECT 
      Chapter.*, Novel.pluginId, Novel.name as novelName, Novel.path as novelPath, Novel.cover as novelCover, Novel.id as novelId
    FROM Chapter 
    JOIN Novel
    ON Chapter.novelId = Novel.id AND Chapter.readTime IS NOT NULL
    GROUP BY novelId
    HAVING readTime = MAX(readTime)
    ORDER BY readTime DESC
    `;

export const getHistoryFromDb = async (): Promise<History[]> => {
  return (await getAllTransaction(db, [[getHistoryQuery]])) as any;
};

export const insertHistory = async (chapterId: number) => {
  runTransaction(db, [
    [
      "UPDATE Chapter SET readTime = datetime('now','localtime') WHERE id = ?",
      [chapterId],
    ],
  ]);
};

export const deleteChapterHistory = async (chapterId: number) => {
  runTransaction(db, [
    ['UPDATE Chapter SET readTime = NULL WHERE id = ?', [chapterId]],
  ]);
};

export const deleteAllHistory = async () => {
  runTransaction(db, [['UPDATE Chapter SET readTime = NULL']]);

  showToast(getString('historyScreen.deleted'));
};
