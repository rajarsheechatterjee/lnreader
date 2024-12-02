import * as SQLite from 'expo-sqlite';
import {
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

import { createRepositoryTableQuery } from './tables/RepositoryTable';
import { MMKVStorage } from '@utils/mmkv/mmkv';

const dbName = 'lnreader.db';

export const db = SQLite.openDatabaseSync(dbName);

export const createTables = () => {
  const isOnBoard = MMKVStorage.getBoolean('IS_ONBOARDED');
  if (!isOnBoard) {
    db.execSync('PRAGMA foreign_keys = ON');
    db.withTransactionSync(() => {
      db.execSync(createNovelTableQuery);
      db.execSync(createCategoriesTableQuery);
      db.execSync(createCategoryDefaultQuery);
      db.execSync(createNovelCategoryTableQuery);
      db.execSync(createChapterTableQuery);
      db.execSync(createCategoryTriggerQuery);
      db.execSync(createChapterNovelIdIndexQuery);
      db.execSync(createRepositoryTableQuery);
    });
  }
};
