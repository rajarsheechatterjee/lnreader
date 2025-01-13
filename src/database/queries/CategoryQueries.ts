import { noop } from 'lodash-es';
import { BackupCategory, Category, NovelCategory, CCategory } from '../types';
import { showToast } from '@utils/showToast';
import { txnErrorCallback } from '../utils/helpers';
import { getString } from '@strings/translations';
import { db } from '@database/db';
import { LibrarySortOrder } from '@screens/library/constants/constants';

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

export const getCategoriesWithCount = async (
  novelIds: number[],
): Promise<CCategory[]> => {
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

  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getCategoriesWithCountQuery,
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

const createCategoryQuery = 'INSERT INTO Category (name) VALUES (?)';

export const createCategory = (categoryName: string): void =>
  db.transaction(tx =>
    tx.executeSql(createCategoryQuery, [categoryName], noop, txnErrorCallback),
  );

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
  db.transaction(tx => {
    tx.executeSql(
      beforeDeleteCategoryQuery,
      [category.id],
      noop,
      txnErrorCallback,
    );
    tx.executeSql(deleteCategoryQuery, [category.id], noop, txnErrorCallback);
  });
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

const updateCategorySortContentsQuery =
  'UPDATE Category SET sortContents = ? WHERE id = ?';

export const updateCategorySortContents = (
  categoryId: number,
  sortContents: LibrarySortOrder,
): void =>
  db.transaction(tx =>
    tx.executeSql(
      updateCategorySortContentsQuery,
      [sortContents, categoryId],
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

export const updateCategoryOrderInDb = (categories: Category[]): void => {
  // Do not set local as default one
  if (categories.length && categories[0].id === 2) {
    return;
  }
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
};

export const getAllNovelCategories = (): Promise<NovelCategory[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM NovelCategory',
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

export const _restoreCategory = (category: BackupCategory) => {
  db.transaction(tx => {
    tx.executeSql('DELETE FROM Category WHERE id = ? OR sort = ?', [
      category.id,
      category.sort,
    ]);
  });
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Category (id, name, sort, sortContents) VALUES (?, ?, ?)',
      [category.id, category.name, category.sort, category.sortContents],
    );
    for (const novelId of category.novelIds) {
      tx.executeSql(
        'INSERT INTO NovelCategory (categoryId, novelId) VALUES (?, ?)',
        [category.id, novelId],
      );
    }
  });
};
