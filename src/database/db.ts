import * as SQLite from 'expo-sqlite';
import {
  addSortContentsToTable,
  createCategoriesTableQuery,
  createCategoryDefaultQuery,
  createCategoryTriggerQuery,
} from './tables/CategoryTable';
import { createNovelTableQuery } from './tables/NovelTable';
import { createNovelCategoryTableQuery } from './tables/NovelCategoryTable';
import {
  createChapterTableQuery,
  createChapterNovelIdIndexQuery,
} from './tables/ChapterTable';
import { dbTxnErrorCallback } from './utils/helpers';
import { noop } from 'lodash-es';
import { createRepositoryTableQuery } from './tables/RepositoryTable';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabase(dbName);

export const createTables = () => {
  db.exec([{ sql: 'PRAGMA foreign_keys = ON', args: [] }], false, () => {});
  db.transaction(tx => {
    tx.executeSql(createNovelTableQuery);
    tx.executeSql(createCategoriesTableQuery);
    tx.executeSql(createCategoryDefaultQuery);
    tx.executeSql(createCategoryTriggerQuery);
    tx.executeSql(createNovelCategoryTableQuery);
    tx.executeSql(createChapterTableQuery);
    tx.executeSql(createChapterNovelIdIndexQuery);
  });

  db.transaction(tx => {
    tx.executeSql(createRepositoryTableQuery);
  });

  addSortContentsToTable(db);
};

/**
 * For Testing
 */
export const deleteDatabase = async () => {
  db.transaction(
    tx => {
      tx.executeSql('DROP TABLE Category');
      tx.executeSql('DROP TABLE Novel');
      tx.executeSql('DROP TABLE NovelCategory');
      tx.executeSql('DROP TABLE Chapter');
      tx.executeSql('DROP TABLE Download');
      tx.executeSql('DROP TABLE Repository');
    },
    dbTxnErrorCallback,
    noop,
  );
};
