import * as SQLite from 'expo-sqlite';
import { noop } from 'lodash-es';
import { Category } from '../types';
import { showToast } from '@hooks/showToast';
import { txnErrorCallback } from '../utils/helpers';
const db = SQLite.openDatabase('lnreader.db');

const getCategoriesQuery = `
  SELECT * FROM Category ORDER BY sort
	`;

export const getCategoriesFromDb = async (): Promise<Category[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getCategoriesQuery,
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const getNovelCategoriesQuery = `
  SELECT * FROM 
  Category JOIN NovelCategory 
  JOIN Novel 
  ON Category.id = NovelCategory.categoryId AND NovelCategory.novelId = ?
`;

export const getNovelCategories = (novelId: number): Promise<Category[]> => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        getNovelCategoriesQuery,
        [novelId],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    });
  });
};

const createCategoryQuery = 'INSERT INTO Category (name) VALUES (?)';

export const createCategory = (categoryName: string): void =>
  db.transaction(tx =>
    tx.executeSql(createCategoryQuery, [categoryName], noop, txnErrorCallback),
  );

const deleteCategoryQuery = 'DELETE FROM Category WHERE id = ?';

export const deleteCategoryById = (categoryId: number): void => {
  if (categoryId === 1) {
    return showToast('You cant delete default category');
  }
  db.transaction(tx =>
    tx.executeSql(deleteCategoryQuery, [categoryId], noop, txnErrorCallback),
  );
};

const updateCategoryQuery = 'UPDATE Category SET name = ? WHERE id = ?';

export const updateCategory = (
  categoryId: number,
  categoryName: string,
): void =>
  db.transaction(tx =>
    tx.executeSql(
      updateCategoryQuery,
      [categoryName, categoryId],
      noop,
      txnErrorCallback,
    ),
  );

const isCategoryNameDuplicateQuery = `
  SELECT COUNT(*) as isDuplicate FROM Category WHERE name = ?
	`;

export const isCategoryNameDuplicate = (
  categoryName: string,
): Promise<boolean> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        isCategoryNameDuplicateQuery,
        [categoryName],
        (txObj, { rows }) => {
          const { _array } = rows as any;
          resolve(Boolean(_array[0]?.isDuplicate));
        },
        txnErrorCallback,
      );
    }),
  );
};

const updateCategoryOrderQuery = 'UPDATE Category SET sort = ? WHERE id = ?';

export const updateCategoryOrderInDb = (categories: Category[]): void =>
  db.transaction(tx => {
    categories.map(category => {
      tx.executeSql(
        updateCategoryOrderQuery,
        [category.sort, category.id],
        noop,
        txnErrorCallback,
      );
    });
  });
