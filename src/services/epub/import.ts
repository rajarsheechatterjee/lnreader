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
import { BackgroundTaskMetadata } from '@services/ServiceManager';

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

export const importEpub = async (
  {
    uri,
    filename,
  }: {
    uri: string;
    filename: string;
  },
  setMeta: (
    transformer: (meta: BackgroundTaskMetadata) => BackgroundTaskMetadata,
  ) => void,
) => {
  setMeta(meta => ({
    ...meta,
    isRunning: true,
    progress: 0,
  }));

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
    for (let i = 0; i < novel.chapters?.length; i++) {
      const chapter = novel.chapters[i];
      if (!chapter.name) {
        chapter.name = chapter.path.split(/[\\\/]/).pop() || 'unknown';
      }

      setMeta(meta => ({
        ...meta,
        progressText: chapter.name,
      }));

      const filePaths = await insertLocalChapter(
        novelId,
        i,
        chapter.name,
        chapter.path,
        now,
      );
      filePaths.forEach(filePath => filePathSet.add(filePath));

      setMeta(meta => ({
        ...meta,
        progress: i / novel.chapters.length,
      }));
    }
  }
  const novelDir = NOVEL_STORAGE + '/local/' + novelId;

  setMeta(meta => ({
    ...meta,
    progressText: getString('advancedSettingsScreen.importStaticFiles'),
  }));

  for (let filePath of filePathSet) {
    if (await FileManager.exists(filePath)) {
      await FileManager.moveFile(
        filePath,
        novelDir + '/' + filePath.split(/[\\\/]/).pop(),
      );
    }
  }

  setMeta(meta => ({
    ...meta,
    progress: 1,
    isRunning: false,
  }));
};
