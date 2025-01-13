import { getString } from '@strings/translations';
import { SQLiteDatabase } from 'expo-sqlite';
import { txnErrorCallback } from '@database/utils/helpers';

export const createCategoriesTableQuery = `
  CREATE TABLE IF NOT EXISTS Category (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL UNIQUE,
    sort INTEGER,
    sortContents TEXT
  );
`;

export const createCategoryTriggerQuery = `
  CREATE TRIGGER IF NOT EXISTS add_category AFTER INSERT ON Category
  BEGIN
    UPDATE Category SET sort = (SELECT IFNULL(sort, new.id)) WHERE id = new.id;
  END;
`;

// if category with id = 2 exists, nothing in db.ts file is executed
export const createCategoryDefaultQuery = `
INSERT INTO Category (id, name, sort) VALUES 
  (1, "${getString('categories.default')}", 1),
  (2, "${getString('categories.local')}", 2)
`;

export const addSortContentsToTable = (db: SQLiteDatabase) => {
  db.transaction(tx => {
    tx.executeSql(
      'PRAGMA table_info("Category");',
      [],
      (tx2, resultSet) => {
        const hasSortContents = !!resultSet.rows._array.find(
          v => v.name === 'sortContents',
        );
        if (!hasSortContents) {
          tx.executeSql('ALTER TABLE Category ADD COLUMN sortContents TEXT;');
        }
      },
      txnErrorCallback,
    );
  });
};
