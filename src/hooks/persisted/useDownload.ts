import { ChapterInfo, NovelInfo } from '@database/types';
import ServiceManager, {
  BackgroundTaskMetadata,
  DownloadChapterTask,
  QueuedBackgroundTask,
} from '@services/ServiceManager';
import { useMemo } from 'react';
import { useMMKVObject } from 'react-native-mmkv';

export const DOWNLOAD_QUEUE = 'DOWNLOAD';
export const CHAPTER_DOWNLOADING = 'CHAPTER_DOWNLOADING';

export default function useDownload() {
  const [queue] = useMMKVObject<QueuedBackgroundTask[]>(
    ServiceManager.manager.STORE_KEY,
  );
  const downloadQueue = useMemo(
    () => queue?.filter(t => t.task.name === 'DOWNLOAD_CHAPTER') || [],
    [queue],
  ) as { task: DownloadChapterTask; meta: BackgroundTaskMetadata }[];

  const downloadChapter = (novel: NovelInfo, chapter: ChapterInfo) =>
    ServiceManager.manager.addTask({
      name: 'DOWNLOAD_CHAPTER',
      data: {
        chapterId: chapter.id,
        novelName: novel.name,
        chapterName: chapter.name,
      },
    });
  const downloadChapters = (novel: NovelInfo, chapters: ChapterInfo[]) =>
    ServiceManager.manager.addTask(
      chapters.map(chapter => ({
        name: 'DOWNLOAD_CHAPTER',
        data: {
          chapterId: chapter.id,
          novelName: novel.name,
          chapterName: chapter.name,
        },
      })),
    );
  const resumeDowndload = () => ServiceManager.manager.resume();

  const pauseDownload = () => ServiceManager.manager.pause();

  const cancelDownload = () =>
    ServiceManager.manager.removeTasksByName('DOWNLOAD_CHAPTER');

  return {
    downloadQueue,
    resumeDowndload,
    downloadChapter,
    downloadChapters,
    pauseDownload,
    cancelDownload,
  };
}
