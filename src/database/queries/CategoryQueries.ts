import * as SQLite from 'expo-sqlite';
import { BackupCategory, Category, NovelCategory, CCategory } from '../types';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import { db } from '@database/db';
import { getAllSync, runSyncTransaction } from '@database/utils/helpers';

const getCategoriesQuery = `
  SELECT * FROM Category ORDER BY sort
	`;

export const getCategoriesFromDb = (): Category[] => {
  return getAllSync(db, [[getCategoriesQuery]]) as any;
};

export const getCategoriesWithCount = (novelIds: number[]): CCategory[] => {
  const getCategoriesWithCountQuery = `
  SELECT *, novelsCount 
  FROM Category LEFT JOIN 
  (
    SELECT categoryId, COUNT(novelId) as novelsCount 
    FROM NovelCategory WHERE novelId in (${novelIds.join(
      ',',
    )}) GROUP BY categoryId 
  ) as NC ON Category.id = NC.categoryId
  WHERE Category.id != 2
  ORDER BY sort
	`;
  return getAllSync(db, [[getCategoriesWithCountQuery]]) as any;
};

const createCategoryQuery = 'INSERT INTO Category (name) VALUES (?)';

export const createCategory = (categoryName: string): void =>
  runSyncTransaction(db, [[createCategoryQuery, [categoryName]]]);

const beforeDeleteCategoryQuery = `
    UPDATE NovelCategory SET categoryId = (SELECT id FROM Category WHERE sort = 1)
    WHERE novelId IN (
      SELECT novelId FROM NovelCategory
      GROUP BY novelId
      HAVING COUNT(categoryId) = 1
    )
    AND categoryId = ?;
`;
const deleteCategoryQuery = 'DELETE FROM Category WHERE id = ?';

export const deleteCategoryById = (category: Category): void => {
  if (category.sort === 1 || category.id === 2) {
    return showToast(getString('categories.cantDeleteDefault'));
  }
  runSyncTransaction(db, [
    [beforeDeleteCategoryQuery, [category.id]],
    [deleteCategoryQuery, [category.id]],
  ]);
};

const updateCategoryQuery = 'UPDATE Category SET name = ? WHERE id = ?';

export const updateCategory = (
  categoryId: number,
  categoryName: string,
): void =>
  runSyncTransaction(db, [[updateCategoryQuery, [categoryName, categoryId]]]);

const isCategoryNameDuplicateQuery = `
  SELECT COUNT(*) as isDuplicate FROM Category WHERE name = ?
	`;

export const isCategoryNameDuplicate = (categoryName: string): boolean => {
  let res = db.getFirstSync(isCategoryNameDuplicateQuery, [categoryName]);

  if (res instanceof Object && 'isDuplicate' in res) {
    return Boolean(res.isDuplicate);
  } else {
    throw 'isCategoryNameDuplicate return type does not match.';
  }
};

const updateCategoryOrderQuery = 'UPDATE Category SET sort = ? WHERE id = ?';

export const updateCategoryOrderInDb = (categories: Category[]): void => {
  // Do not set local as default one
  if (categories.length && categories[0].id === 2) {
    return;
  }
  runSyncTransaction(
    db,
    categories.map(c => {
      return [updateCategoryOrderQuery, [c.sort, c.id]];
    }),
  );
};

export const getAllNovelCategories = (): NovelCategory[] =>
  getAllSync(db, [[`SELECT * FROM NovelCategory`]]) as any;

export const _restoreCategory = (category: BackupCategory) => {
  const d = category.novelIds.map(novelId => [
    'INSERT INTO NovelCategory (categoryId, novelId) VALUES (?, ?)',
    [category.id, novelId],
  ]) as Array<[string, SQLite.SQLiteBindParams]>;

  runSyncTransaction(db, [
    [
      'DELETE FROM Category WHERE id = ? OR sort = ?',
      [category.id, category.sort],
    ],
    [
      'INSERT INTO Category (id, name, sort) VALUES (?, ?, ?)',
      [category.id, category.name, category.sort],
    ],
    ...d,
  ]);
};
