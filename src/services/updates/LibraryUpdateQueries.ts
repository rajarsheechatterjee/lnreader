import { fetchNovel, fetchPage } from '../plugin/fetch';
import { ChapterItem, SourceNovel } from '@plugins/types';
import { getPlugin, LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import FileManager from '@native/FileManager';
import { NOVEL_STORAGE } from '@utils/Storages';
import { downloadFile } from '@plugins/helpers/fetch';
import ServiceManager from '@services/ServiceManager';
import { db } from '@database/db';
import { getPageChapters } from '@database/queries/ChapterQueries';

const updateNovelMetadata = (
  pluginId: string,
  novelId: number,
  novel: SourceNovel,
) => {
  return new Promise(async (resolve, reject) => {
    let { name, cover, summary, author, artist, genres, status, totalPages } =
      novel;
    const novelDir = NOVEL_STORAGE + '/' + pluginId + '/' + novelId;
    if (!(await FileManager.exists(novelDir))) {
      await FileManager.mkdir(novelDir);
    }
    if (cover) {
      const novelCoverPath = novelDir + '/cover.png';
      const novelCoverUri = 'file://' + novelCoverPath;
      downloadFile(
        cover,
        novelCoverPath,
        getPlugin(pluginId)?.imageRequestInit,
      );
      cover = novelCoverUri + '?' + Date.now();
    }
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE Novel SET 
          name = ?, cover = ?, summary = ?, author = ?, artist = ?, 
          genres = ?, status = ?, totalPages = ?
          WHERE id = ?
        `,
        [
          name,
          cover || null,
          summary || null,
          author || 'unknown',
          artist || null,
          genres || null,
          status || null,
          totalPages || 0,
          novelId,
        ],
        () => resolve(null),
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const updateNovelTotalPages = (novelId: number, totalPages: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Novel SET totalPages = ? WHERE id = ?',
        [totalPages, novelId],
        () => resolve(null),
        (txObj, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const updateNovelChapters = async (
  novelName: string,
  novelId: number,
  chapters: ChapterItem[],
  downloadNewChapters?: boolean,
  page?: string,
) => {
  const existingChapters = await getPageChapters(
    novelId,
    '',
    '',
    chapters[0].page || '1',
  );
  const chaptersToHide = existingChapters.filter(
    c => !chapters.some(ch => ch.path === c.path),
  );

  return new Promise((resolve, reject) => {
    db.transaction(async tx => {
      for (let position = 0; position < chapters.length; position++) {
        const {
          name,
          path,
          releaseTime,
          page: customPage,
          chapterNumber,
        } = chapters[position];
        const chapterPage = page || customPage || '1';
        tx.executeSql(
          `
            INSERT INTO Chapter (path, name, releaseTime, novelId, updatedTime, chapterNumber, page, position)
            SELECT ?, ?, ?, ?, datetime('now','localtime'), ?, ?, ?
            WHERE NOT EXISTS (SELECT id FROM Chapter WHERE path = ? AND novelId = ?);
          `,
          [
            path,
            name,
            releaseTime || null,
            novelId,
            chapterNumber || null,
            chapterPage,
            position,
            path,
            novelId,
          ],
          (txObj, { insertId }) => {
            if (insertId && insertId >= 0) {
              if (downloadNewChapters) {
                ServiceManager.manager.addTask({
                  name: 'DOWNLOAD_CHAPTER',
                  data: {
                    chapterId: insertId,
                    novelName: novelName,
                    chapterName: name,
                  },
                });
              }
            } else {
              tx.executeSql(
                `
                  UPDATE Chapter SET 
                    name = ?, releaseTime = ?, updatedTime = datetime('now','localtime'), page = ?, position = ?, hidden = 0
                  WHERE path = ? AND novelId = ? AND (name != ? OR releaseTime != ? OR page != ? OR position != ? OR hidden != 0);
                `,
                [
                  name,
                  releaseTime || null,
                  chapterPage,
                  position,
                  path,
                  novelId,
                  name,
                  releaseTime || null,
                  chapterPage,
                  position,
                ],
                undefined,
                (txObj, error) => {
                  reject(error);
                  return false;
                },
              );
            }
          },
          (txObj, error) => {
            reject(error);
            return false;
          },
        );
      }
      chaptersToHide.forEach(chapter => {
        tx.executeSql(
          'UPDATE Chapter SET hidden = 1 WHERE path = ? AND novelId = ?',
          [chapter.path, novelId],
        );
      });
      resolve(null);
    });
  });
};

export interface UpdateNovelOptions {
  downloadNewChapters?: boolean;
  refreshNovelMetadata?: boolean;
}

const updateNovel = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  options: UpdateNovelOptions,
) => {
  if (pluginId === LOCAL_PLUGIN_ID) {
    return;
  }
  const { downloadNewChapters, refreshNovelMetadata } = options;
  const novel = await fetchNovel(pluginId, novelPath);
  if (refreshNovelMetadata) {
    await updateNovelMetadata(pluginId, novelId, novel);
  } else if (novel.totalPages) {
    // at least update totalPages,
    await updateNovelTotalPages(novelId, novel.totalPages);
  }
  await updateNovelChapters(
    novel.name,
    novelId,
    novel.chapters || [],
    downloadNewChapters,
  );
};

const updateNovelPage = async (
  pluginId: string,
  novelPath: string,
  novelId: number,
  page: string,
  options: Pick<UpdateNovelOptions, 'downloadNewChapters'>,
) => {
  const { downloadNewChapters } = options;
  const sourcePage = await fetchPage(pluginId, novelPath, page);
  await updateNovelChapters(
    pluginId,
    novelId,
    sourcePage.chapters || [],
    downloadNewChapters,
    page,
  );
};

export { updateNovel, updateNovelPage };
