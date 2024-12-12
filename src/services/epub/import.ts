import BackgroundService from 'react-native-background-actions';
import ZipArchive from '@native/ZipArchive';
import dayjs from 'dayjs';
import {
  updateNovelCategoryById,
  updateNovelInfo,
} from '@database/queries/NovelQueries';
import { LOCAL_PLUGIN_ID } from '@plugins/pluginManager';
import { getString } from '@strings/translations';
import FileManager from '@native/FileManager';
import EpubUtil from '@native/EpubUtil';
import { NOVEL_STORAGE } from '@utils/Storages';
import { db } from '@database/db';

const insertLocalNovel = async (
  name: string,
  path: string,
  cover?: string,
  author?: string,
  artist?: string,
  summary?: string,
) => {
  const insertedNovel = await db.runAsync(
    `
      INSERT INTO 
        Novel(name, path, pluginId, inLibrary, isLocal) 
        VALUES(?, ?, 'local', 1, 1)`,
    name,
    path,
  );
  if (insertedNovel.lastInsertRowId && insertedNovel.lastInsertRowId >= 0) {
    await updateNovelCategoryById(insertedNovel.lastInsertRowId, [2]);
    const novelDir = NOVEL_STORAGE + '/local/' + insertedNovel.lastInsertRowId;
    await FileManager.mkdir(novelDir);
    const newCoverPath =
      'file://' + novelDir + '/' + cover?.split(/[\/\\]/).pop();
    if (cover && (await FileManager.exists(cover))) {
      await FileManager.moveFile(cover, newCoverPath);
    }
    await updateNovelInfo({
      id: insertedNovel.lastInsertRowId,
      pluginId: LOCAL_PLUGIN_ID,
      author: author,
      artist: artist,
      summary: summary,
      path: NOVEL_STORAGE + '/local/' + insertedNovel.lastInsertRowId,
      cover: newCoverPath,
      name: name,
      inLibrary: true,
      isLocal: true,
      totalPages: 0,
    });
    return insertedNovel.lastInsertRowId;
  }
  throw new Error(getString('advancedSettingsScreen.novelInsertFailed'));
};

const insertLocalChapter = async (
  novelId: number,
  fakeId: number,
  name: string,
  path: string,
  releaseTime: string,
): Promise<string[]> => {
  const insertedChapter = await db.runAsync(
    'INSERT INTO Chapter(novelId, name, path, releaseTime, position) VALUES(?, ?, ?, ?, ?)',
    novelId,
    name,
    NOVEL_STORAGE + '/local/' + novelId + '/' + fakeId,
    releaseTime,
    fakeId,
  );
  if (insertedChapter.lastInsertRowId && insertedChapter.lastInsertRowId >= 0) {
    let chapterText: string = '';
    try {
      path = decodeURI(path);
    } catch {
      // nothing to do
    }
    chapterText = FileManager.readFile(path);
    if (!chapterText) {
      return [];
    }
    const staticPaths: string[] = [];
    const novelDir = NOVEL_STORAGE + '/local/' + novelId;
    const epubContentDir = path.replace(/[^\\\/]+$/, '');
    chapterText = chapterText.replace(
      /(href|src)=(["'])(.*?)\2/g,
      (_, $1, __, $3: string) => {
        if ($3) {
          staticPaths.push(epubContentDir + '/' + $3);
        }
        return `${$1}="file://${novelDir}/${$3.split(/[\\\/]/)?.pop()}"`;
      },
    );
    await FileManager.mkdir(novelDir + '/' + insertedChapter.lastInsertRowId);
    await FileManager.writeFile(
      novelDir + '/' + insertedChapter.lastInsertRowId + '/index.html',
      chapterText,
    );
    return staticPaths;
  }
  throw new Error(getString('advancedSettingsScreen.chapterInsertFailed'));
};

export const importEpub = async ({
  uri,
  filename,
}: {
  uri: string;
  filename: string;
}) => {
  const epubFilePath = FileManager.ExternalCachesDirectoryPath + '/novel.epub';
  await FileManager.copyFile(uri, epubFilePath);
  const epubDirPath = FileManager.ExternalCachesDirectoryPath + '/epub';
  if (await FileManager.exists(epubDirPath)) {
    await FileManager.unlink(epubDirPath);
  }
  await FileManager.mkdir(epubDirPath);
  await ZipArchive.unzip(epubFilePath, epubDirPath);
  const novel = await EpubUtil.parseNovelAndChapters(epubDirPath);
  if (!novel.name) {
    novel.name = filename.replace('.epub', '') || 'Untitled';
  }
  const novelId = await insertLocalNovel(
    novel.name,
    epubDirPath + novel.name, // temporary
    novel.cover,
    novel.author,
    novel.artist,
    novel.summary,
  );
  const now = dayjs().toISOString();
  const filePathSet = new Set<string>();
  if (novel.chapters) {
    BackgroundService.updateNotification({
      taskTitle: getString('advancedSettingsScreen.importNovel'),
      taskDesc: '0/' + novel.chapters.length,
      progressBar: {
        value: 0,
        max: novel.chapters.length,
      },
    });
    for (let i = 0; i < novel.chapters?.length; i++) {
      BackgroundService.updateNotification({
        taskDesc: i + 1 + '/' + novel.chapters.length,
        progressBar: {
          value: i + 1,
          max: novel.chapters.length,
        },
      });
      const chapter = novel.chapters[i];
      if (!chapter.name) {
        chapter.name = chapter.path.split(/[\\\/]/).pop() || 'unknown';
      }
      const filePaths = await insertLocalChapter(
        novelId,
        i,
        chapter.name,
        chapter.path,
        now,
      );
      filePaths.forEach(filePath => filePathSet.add(filePath));
    }
  }
  const novelDir = NOVEL_STORAGE + '/local/' + novelId;
  BackgroundService.updateNotification({
    taskTitle: getString('advancedSettingsScreen.importStaticFiles'),
    taskDesc: '0/' + filePathSet.size,
    progressBar: {
      value: 0,
      max: filePathSet.size,
    },
  });
  let cnt = 1;
  for (let filePath of filePathSet) {
    BackgroundService.updateNotification({
      taskDesc: cnt + '/' + filePathSet.size,
      progressBar: {
        value: cnt,
        max: filePathSet.size,
      },
    });
    if (await FileManager.exists(filePath)) {
      await FileManager.moveFile(
        filePath,
        novelDir + '/' + filePath.split(/[\\\/]/).pop(),
      );
    }
    cnt += 1;
  }
};
