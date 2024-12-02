import * as SQLite from 'expo-sqlite';

import {Repository} from '@database/types';

import {getAllTransaction, runTransaction} from '../utils/helpers';

const db = SQLite.openDatabaseSync('lnreader.db');

const getRepositoriesQuery = 'SELECT * FROM Repository';

export const getRepositoriesFromDb = async (): Promise<Repository[]> => {
  return getAllTransaction(db, [[getRepositoriesQuery]]) as any;
};

const isRepoUrlDuplicateQuery = `
  SELECT COUNT(*) as isDuplicate FROM Repository WHERE url = ?
	`;

export const isRepoUrlDuplicate = (repoUrl: string): Promise<boolean> => {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      db.getFirstAsync(isRepoUrlDuplicateQuery, [repoUrl]).then(res => {
        if (res instanceof Object && 'isDuplicate' in res) {
          resolve(Boolean(res.isDuplicate));
        } else {
          throw 'isCategoryNameDuplicate return type does not match.';
        }
      });
    }),
  );
};

const createRepositoryQuery = 'INSERT INTO Repository (url) VALUES (?)';

export const createRepository = (repoUrl: string): void => {
  new Promise(resolve =>
    runTransaction(db, [[createRepositoryQuery, [repoUrl]]]).then(resolve),
  );
};

const deleteRepositoryQuery = 'DELETE FROM Repository WHERE id = ?';

export const deleteRepositoryById = (id: number): void => {
  runTransaction(db, [[deleteRepositoryQuery, [id]]]);
};

const updateRepositoryQuery = 'UPDATE Repository SET name = ? WHERE id = ?';

export const updateRepository = (id: number, url: string): void => {
  new Promise(resolve =>
    runTransaction(db, [[updateRepositoryQuery, [url, id]]]).then(resolve),
  );
};
