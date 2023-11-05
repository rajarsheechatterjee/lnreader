import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

import * as DocumentPicker from 'expo-document-picker';

import { fetchChapters, fetchNovel } from '@services/plugin/fetch';
import { insertChapters } from './ChapterQueries';

import { showToast } from '@hooks/showToast';
import { txnErrorCallback } from '../utils/helpers';
import { noop } from 'lodash-es';
import { getString } from '@strings/translations';
import { NovelInfo } from '../types';
import { SourceNovel } from '@plugins/types';

export const insertNovelAndChapters = (
  pluginId: string,
  sourceNovel: SourceNovel,
): Promise<number> => {
  const insertNovelQuery =
    'INSERT INTO Novel (url, pluginId, name, cover, summary, author, artist, status, genres) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        insertNovelQuery,
        [
          sourceNovel.url,
          pluginId,
          sourceNovel.name,
          sourceNovel.cover || '',
          sourceNovel.summary || '',
          sourceNovel.author || '',
          sourceNovel.artist || '',
          sourceNovel.status || '',
          sourceNovel.genres || '',
        ],
        (txObj, resultSet) => {
          if (resultSet.insertId) {
            insertChapters(resultSet.insertId, sourceNovel.chapters).then(() =>
              resolve(resultSet.insertId || 1),
            );
          }
        },
        txnErrorCallback,
      );
    });
  });
};

export const getNovel = async (novelUrl: string): Promise<NovelInfo> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Novel WHERE url = ?',
        [novelUrl],
        (txObj, { rows }) => resolve(rows.item(0)),
        txnErrorCallback,
      );
    }),
  );
};

// if query is insert novel || add to library => add default category name for it
// else remove all it's categories

export const switchNovelToLibrary = async (
  novelUrl: string,
  pluginId: string,
) => {
  const novel = await getNovel(novelUrl);
  if (novel) {
    if (novel.inLibrary) {
      return;
    }
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET inLibrary = ? WHERE id = ?',
        [1 - novel.inLibrary, novel.id],
        noop,
        txnErrorCallback,
      );
      if (novel.inLibrary === 1) {
        tx.executeSql(
          'DELETE FROM NovelCategory WHERE novelId = ?',
          [novel.id],
          () => showToast(getString('browseScreen.removeFromLibrary')),
          txnErrorCallback,
        );
      } else {
        tx.executeSql(
          'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
          [novel.id],
          () => showToast(getString('browseScreen.addedToLibrary')),
          txnErrorCallback,
        );
      }
    });
  } else {
    const sourceNovel = await fetchNovel(pluginId, novelUrl);
    const novelId = await insertNovelAndChapters(pluginId, sourceNovel);
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET inLibrary = 1 WHERE url = ?',
        [novelUrl],
        () => showToast(getString('browseScreen.addedToLibrary')),
        txnErrorCallback,
      );
      tx.executeSql(
        'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
        [novelId],
        noop,
        txnErrorCallback,
      );
    });
  }
};

// allow to delete local novels
export const removeNovelsFromLibrary = (novelIds: Array<number>) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE Novel SET inLibrary = 0 WHERE id IN (${novelIds.join(', ')});`,
    );
    tx.executeSql(
      `DELETE FROM NovelCategory WHERE novelId IN (${novelIds.join(', ')});`,
    );
  });
  showToast('Removed from Library');
};

export const deleteNovelCache = () => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM Novel WHERE inLibrary = 0',
      [],
      () => showToast('Cached novels deleted'),
      txnErrorCallback,
    );
  });
};

const restoreFromBackupQuery =
  'INSERT INTO Novel (url, name, pluginId, cover, summary, author, artist, status, genres, inLibrary) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

export const restoreLibrary = async (novel: NovelInfo) => {
  return new Promise(resolve => {
    db.transaction(tx =>
      tx.executeSql(
        restoreFromBackupQuery,
        [
          novel.url,
          novel.name,
          novel.pluginId,
          novel.cover || '',
          novel.summary || '',
          novel.author || '',
          novel.artist || '',
          novel.status || '',
          novel.genres || '',
          novel.inLibrary,
        ],
        async (txObj, { insertId }) => {
          if (!insertId) {
            return;
          }
          tx.executeSql(
            'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
            [insertId],
            noop,
            txnErrorCallback,
          );
          const chapters = await fetchChapters(novel.pluginId, novel.url);

          if (chapters) {
            await insertChapters(insertId, chapters);
            resolve(insertId);
          }
        },
        txnErrorCallback,
      ),
    );
  });
};

export const updateNovelInfo = async (info: NovelInfo) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE Novel SET name = ?, cover = ?, url = ? , summary = ?, author = ?, artist = ?, genres = ?, status = ?, isLocal = ? WHERE id = ?',
      [
        info.name,
        info.cover || '',
        info.url,
        info.summary || '',
        info.author || '',
        info.artist || '',
        info.genres || '',
        info.status || '',
        info.isLocal,
        info.id,
      ],
      noop,
      txnErrorCallback,
    );
  });
};

export const pickCustomNovelCover = async (novelId: number) => {
  const image = await DocumentPicker.getDocumentAsync({ type: 'image/*' });

  if (image.type === 'success' && image.uri) {
    const uri = 'file://' + image.uri;

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET cover = ? WHERE id = ?',
        [uri, novelId],
        noop,
        txnErrorCallback,
      );
    });
    return image.uri;
  }
};

export const updateNovelCategoryById = async (
  novelId: number,
  categoryIds: number[],
) => {
  db.transaction(tx => {
    categoryIds.forEach(categoryId => {
      tx.executeSql(
        'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, ?)',
        [novelId, categoryId],
        noop,
        txnErrorCallback,
      );
    });
  });
};

export const updateNovelCategories = async (
  novelIds: number[],
  categoryIds: number[],
  option: string,
): Promise<void> => {
  let queries: string[] = [];
  // allow local novels have other categories, but not the revesre
  categoryIds = categoryIds.filter(id => id !== 2);
  if (option === 'KEEP_OLD') {
    novelIds.forEach(novelId => {
      categoryIds.forEach(categoryId =>
        queries.push(
          `INSERT OR REPLACE INTO NovelCategory (novelId, categoryId) VALUES (${novelId}, ${categoryId})`,
        ),
      );
    });
  } else {
    novelIds.forEach(novelId =>
      queries.push(`DELETE FROM NovelCategory WHERE novelId = ${novelId}`),
    );
    novelIds.forEach(novelId => {
      categoryIds.forEach(categoryId =>
        queries.push(
          `INSERT INTO NovelCategory (novelId, categoryId) VALUES (${novelId}, ${categoryId})`,
        ),
      );
    });
  }
  return new Promise(resolve => {
    db.transaction(tx => {
      queries.forEach((query, index) => {
        tx.executeSql(
          query,
          [],
          () => {
            if (index === queries.length - 1) {
              resolve();
            }
          },
          txnErrorCallback,
        );
      });
    });
  });
};
