import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('lnreader.db');

import * as DocumentPicker from 'expo-document-picker';

import {fetchNovel} from '@services/plugin/fetch';
import {insertChapters} from './ChapterQueries';

import {showToast} from '@utils/showToast';
import {
  getAllTransaction,
  getFirstTransaction,
  QueryObject,
  runTransaction,
} from '../utils/helpers';
import {getString} from '@strings/translations';
import {BackupNovel, NovelInfo} from '../types';
import {SourceNovel} from '@plugins/types';
import {NOVEL_STORAGE} from '@utils/Storages';
import FileManager from '@native/FileManager';
import {downloadFile} from '@plugins/helpers/fetch';
import {getPlugin} from '@plugins/pluginManager';

export const insertNovelAndChapters = async (
  pluginId: string,
  sourceNovel: SourceNovel,
): Promise<number | undefined> => {
  const insertNovelQuery =
    'INSERT INTO Novel (path, pluginId, name, cover, summary, author, artist, status, genres, totalPages) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  let novelId: number | undefined;
  await db.withTransactionAsync(async () => {
    db.runAsync(insertNovelQuery, [
      sourceNovel.path,
      pluginId,
      sourceNovel.name,
      sourceNovel.cover || null,
      sourceNovel.summary || null,
      sourceNovel.author || null,
      sourceNovel.artist || null,
      sourceNovel.status || null,
      sourceNovel.genres || null,
      sourceNovel.totalPages || 0,
    ]).then(data => {
      novelId = data.lastInsertRowId;
    });
  });

  if (novelId) {
    if (sourceNovel.cover) {
      const novelDir = NOVEL_STORAGE + '/' + pluginId + '/' + novelId;
      await FileManager.mkdir(novelDir);
      const novelCoverPath = novelDir + '/cover.png';
      const novelCoverUri = 'file://' + novelCoverPath;
      downloadFile(
        sourceNovel.cover,
        novelCoverPath,
        getPlugin(pluginId)?.imageRequestInit,
      ).then(() => {
        runTransaction(db, [
          [
            'UPDATE Novel SET cover = ? WHERE id = ?',
            [novelCoverUri, novelId!],
          ],
        ]);
      });
    }
    await insertChapters(novelId, sourceNovel.chapters);
  }
  return novelId;
};

export const getAllNovels = async (): Promise<NovelInfo[]> => {
  return getAllTransaction(db, [['SELECT * FROM Novel']]) as any;
};

export const getNovelById = async (
  novelId: number,
): Promise<NovelInfo | null> => {
  return getFirstTransaction(db, [
    ['SELECT * FROM Novel WHERE id = ?', [novelId]],
  ]) as any;
};

export const getNovelByPath = async (
  novelPath: string,
  pluginId: string,
): Promise<NovelInfo | null> => {
  return getFirstTransaction(db, [
    [
      'SELECT * FROM Novel WHERE path = ? AND pluginId = ?',
      [novelPath, pluginId],
    ],
  ]) as any;
};

// if query is insert novel || add to library => add default category name for it
// else remove all it's categories

export const switchNovelToLibrary = async (
  novelPath: string,
  pluginId: string,
) => {
  const novel = await getNovelByPath(novelPath, pluginId);
  if (novel) {
    let queries: QueryObject = [
      [
        'UPDATE Novel SET inLibrary = ? WHERE id = ?',
        [Number(!novel.inLibrary), novel.id],
      ],
      novel.inLibrary
        ? [
            'DELETE FROM NovelCategory WHERE novelId = ?',
            [novel.id],
            () => showToast(getString('browseScreen.removeFromLibrary')),
          ]
        : [
            'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
            [novel.id],
            () => showToast(getString('browseScreen.addedToLibrary')),
          ],
    ];
    if (novel.pluginId === 'local') {
      queries.push([
        'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, 2)',
        [novel.id],
      ]);
    }
    runTransaction(db, queries);
  } else {
    const sourceNovel = await fetchNovel(pluginId, novelPath);
    const novelId = await insertNovelAndChapters(pluginId, sourceNovel);
    if (novelId) {
      runTransaction(db, [
        [
          'UPDATE Novel SET inLibrary = 1 WHERE id = ?',
          [novelId],
          () => showToast(getString('browseScreen.addedToLibrary')),
        ],
        [
          'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
          [novelId],
        ],
      ]);
    }
  }
};

// allow to delete local novels
export const removeNovelsFromLibrary = (novelIds: Array<number>) => {
  runTransaction(db, [
    [`UPDATE Novel SET inLibrary = 0 WHERE id IN (${novelIds.join(', ')});`],
    [`DELETE FROM NovelCategory WHERE novelId IN (${novelIds.join(', ')});`],
  ]);
  showToast(getString('browseScreen.removeFromLibrary'));
};

export const getCachedNovels = (): Promise<NovelInfo[]> => {
  return getAllTransaction(db, [
    ['SELECT * FROM Novel WHERE inLibrary = 0'],
  ]) as any;
};
export const deleteCachedNovels = async () => {
  runTransaction(db, [
    [
      'DELETE FROM Novel WHERE inLibrary = 0',
      [],
      () =>
        showToast(getString('advancedSettingsScreen.cachedNovelsDeletedToast')),
    ],
  ]);
};

const restoreFromBackupQuery =
  'INSERT OR REPLACE INTO Novel (path, name, pluginId, cover, summary, author, artist, status, genres, totalPages) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

export const restoreLibrary = async (novel: NovelInfo) => {
  const sourceNovel = await fetchNovel(novel.pluginId, novel.path).catch(e => {
    throw e;
  });
  let novelId: number | undefined;
  await db.withTransactionAsync(async () => {
    db.runAsync(restoreFromBackupQuery, [
      sourceNovel.path,
      novel.name,
      novel.pluginId,
      novel.cover || '',
      novel.summary || '',
      novel.author || '',
      novel.artist || '',
      novel.status || '',
      novel.genres || '',
      sourceNovel.totalPages || 0,
    ]).then(data => {
      novelId = data.lastInsertRowId;
    });
  });

  if (novelId && novelId > 0) {
    await new Promise((resolve, reject) => {
      runTransaction(db, [
        [
          'INSERT OR REPLACE INTO NovelCategory (novelId, categoryId) VALUES (?, (SELECT DISTINCT id FROM Category WHERE sort = 1))',
          [novelId!],
          () => {
            db.runAsync('UPDATE Novel SET inLibrary = 1 WHERE id = ?', [
              novelId!,
            ]);
            resolve(null);
          },
          () => {
            reject(null);
            return false;
          },
        ],
      ]);
    }).catch(e => {
      throw e;
    });
    if (sourceNovel.chapters) {
      await insertChapters(novelId, sourceNovel.chapters);
    }
  }
};

export const updateNovelInfo = async (info: NovelInfo) => {
  runTransaction(db, [
    [
      'UPDATE Novel SET name = ?, cover = ?, path = ?, summary = ?, author = ?, artist = ?, genres = ?, status = ?, isLocal = ? WHERE id = ?',
      [
        info.name,
        info.cover || '',
        info.path,
        info.summary || '',
        info.author || '',
        info.artist || '',
        info.genres || '',
        info.status || '',
        Number(info.isLocal),
        info.id,
      ],
    ],
  ]);
};

export const pickCustomNovelCover = async (novel: NovelInfo) => {
  const image = await DocumentPicker.getDocumentAsync({type: 'image/*'});
  if (image.assets && image.assets[0]) {
    const novelDir = NOVEL_STORAGE + '/' + novel.pluginId + '/' + novel.id;
    let novelCoverUri = 'file://' + novelDir + '/cover.png';
    if (!(await FileManager.exists(novelDir))) {
      await FileManager.mkdir(novelDir);
    }
    FileManager.copyFile(image.assets[0].uri, novelCoverUri);
    novelCoverUri += '?' + Date.now();
    runTransaction(db, [
      ['UPDATE Novel SET cover = ? WHERE id = ?', [novelCoverUri, novel.id]],
    ]);
    return novelCoverUri;
  }
};

export const updateNovelCategoryById = async (
  novelId: number,
  categoryIds: number[],
) => {
  runTransaction(
    db,
    categoryIds.map(categoryId => {
      return [
        'INSERT INTO NovelCategory (novelId, categoryId) VALUES (?, ?)',
        [novelId, categoryId],
      ];
    }),
  );
};

export const updateNovelCategories = async (
  novelIds: number[],
  categoryIds: number[],
): Promise<void> => {
  let queries: QueryObject = [];
  queries.push([
    `DELETE FROM NovelCategory WHERE novelId IN (${novelIds.join(
      ',',
    )}) AND categoryId != 2`,
  ]);
  // if no category is selected => set to the default category
  if (categoryIds.length) {
    novelIds.forEach(novelId => {
      categoryIds.forEach(categoryId =>
        queries.push([
          `INSERT INTO NovelCategory (novelId, categoryId) VALUES (${novelId}, ${categoryId})`,
        ]),
      );
    });
  } else {
    novelIds.forEach(novelId => {
      // hacky: insert local novel category -> failed -> ignored
      queries.push([
        `INSERT OR IGNORE INTO NovelCategory (novelId, categoryId) 
         VALUES (
          ${novelId}, 
          IFNULL((SELECT categoryId FROM NovelCategory WHERE novelId = ${novelId}), (SELECT id FROM Category WHERE sort = 1))
        )`,
      ]);
    });
  }
  runTransaction(db, queries);
};

const restoreObjectQuery = (table: string, obj: any) => {
  return `
  INSERT INTO ${table}
  (${Object.keys(obj).join(',')})
  VALUES (${Object.keys(obj)
    .map(() => '?')
    .join(',')})
  `;
};

export const _restoreNovelAndChapters = async (backupNovel: BackupNovel) => {
  const {chapters, ...novel} = backupNovel;
  await runTransaction(db, [
    ['DELETE FROM Novel WHERE id = ?', [novel.id]],
    [
      restoreObjectQuery('Novel', novel),
      Object.values(novel) as string[] | number[],
    ],
  ]);
  runTransaction(
    db,
    chapters.map(chapter => [
      restoreObjectQuery('Chapter', chapter),
      Object.values(chapter) as string[] | number[],
    ]),
  );
};
