import {SQLiteBindParams, SQLiteDatabase, SQLiteRunResult} from 'expo-sqlite';
import {noop} from 'lodash-es';

function logError(error: any) {
  console.error(error);
}

export type QueryObject = Array<
  | [string]
  | [string, SQLiteBindParams | undefined]
  | [
      string,
      SQLiteBindParams | undefined,
      ((data: SQLiteRunResult) => void) | undefined,
    ]
  | [
      string,
      SQLiteBindParams | undefined,
      ((data: SQLiteRunResult) => void) | undefined,
      ((data: any) => void) | undefined,
    ]
>;
export async function runTransaction(
  db: SQLiteDatabase,
  queryObject: QueryObject,
) {
  db.withTransactionAsync(async () => {
    for (const [
      query,
      params,
      callback = noop,
      catchCallback = logError,
    ] of queryObject) {
      db.runAsync(query, params ?? [])
        .then(callback)
        .catch(catchCallback);
    }
  });
}

export function getAllTransaction(
  db: SQLiteDatabase,
  queryObject: Array<[string] | [string, SQLiteBindParams | undefined]>,
) {
  return new Promise((resolve, reject) => {
    for (const [query, params = []] of queryObject) {
      db.getAllAsync(query, params)
        .then(res => {
          resolve(res as any);
        })
        .catch(e => {
          console.error(e);
          reject(e);
        });
    }
  });
  // return new Promise((resolve, reject) =>
  //   db
  //     .withTransactionAsync(async () => {
  //       console.log(queryObject);

  //       for (const [query, params = []] of queryObject) {
  //         console.log(query, params);
  //         db.getAllAsync(query, params)
  //           .then(res => {
  //             console.log(res);

  //             resolve(res as any);
  //           })
  //           .catch(e => {
  //             console.log(e);
  //           });
  //       }
  //     })
  //     .catch(e => {
  //       console.error(e);
  //       reject(e);
  //     }),
  // );
}

export function getFirstTransaction(
  db: SQLiteDatabase,
  queryObject: Array<[string] | [string, SQLiteBindParams | undefined]>,
) {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      for (const [query, params] of queryObject) {
        db.getFirstAsync(query, params ?? [])
          .then(res => {
            resolve(res as any);
          })
          .catch(logError);
      }
    }),
  );
}
