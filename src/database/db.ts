import * as SQLite from 'expo-sqlite';
import {
  createCategoriesTableQuery,
  createCategoryDefaultQuery,
  createCategoryTriggerQuery,
} from './tables/CategoryTable';
import { createNovelTableQuery } from './tables/NovelTable';
import {
  createNovelCategoryTableQuery,
  createNovelCategoryTriggerQuery,
} from './tables/NovelCategoryTable';
import { createChapterTableQuery } from './tables/ChapterTable';
import { createHistoryTableQuery } from './tables/HistoryTable';
import { createDownloadTableQuery } from './tables/DownloadTable';
import { dbTxnErrorCallback } from './utils/helpers';
import { noop } from 'lodash-es';

const dbName = 'lnreader.db';

const db = SQLite.openDatabase(dbName);

export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(createCategoriesTableQuery, [], () => {
      tx.executeSql(createCategoryTriggerQuery);
      tx.executeSql(createCategoryDefaultQuery);
    });
    tx.executeSql(createNovelTableQuery);
    tx.executeSql(createNovelCategoryTableQuery, [], () => {
      tx.executeSql(createNovelCategoryTriggerQuery);
    });
    tx.executeSql(createChapterTableQuery);
    tx.executeSql(createHistoryTableQuery);
    tx.executeSql(createDownloadTableQuery);
  });
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
      tx.executeSql('DROP TABLE History');
      tx.executeSql('DROP TABLE Download');
    },
    dbTxnErrorCallback,
    noop,
  );
};
