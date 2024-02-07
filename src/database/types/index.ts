import { NovelStatus } from '@plugins/types';
export interface NovelInfo {
  id: number;
  path: string;
  pluginId: string;
  name: string;
  cover?: string;
  summary?: string;
  author?: string;
  artist?: string;
  status?: NovelStatus | string;
  genres?: string;
  inLibrary: boolean;
  isLocal: boolean;
  totalPages: number;
}

export interface LibraryNovelInfo extends NovelInfo {
  category: string;
  chaptersUnread: number;
  chaptersDownloaded: number;
}

export interface ChapterInfo {
  id: number;
  novelId: number;
  path: string;
  name: string;
  releaseTime?: string;
  readTime: string | null;
  bookmark: boolean;
  unread: boolean;
  isDownloaded: boolean;
  updatedTime: string | null;
  chapterNumber?: number;
  page: string;
}

export interface DownloadedChapter extends ChapterInfo {
  pluginId: string;
  novelName: string;
  novelPath: string;
  novelCover: string;
}

export interface History {
  id: number; // chapterId xD
  pluginId: string;
  novelId: number;
  novelName: string;
  novelPath: string;
  novelCover: string;
  chapterName: string;
  chapterPath: string;
  readTime: string;
  bookmark: number;
}

export interface Update extends ChapterInfo {
  updatedTime: string;
  pluginId: string;
  novelName: string;
  novelPath: string;
  novelCover: string;
}

export interface Category {
  id: number;
  name: string;
  sort: number;
}

export interface NovelCategory {
  novelId: number;
  categoryId: number;
}

export interface CCategory extends Category {
  novelsCount: number;
}

export interface LibraryStats {
  novelsCount?: number;
  chaptersCount?: number;
  chaptersRead?: number;
  chaptersUnread?: number;
  chaptersDownloaded?: number;
  sourcesCount?: number;
  genres?: Record<string, number>;
  status?: Record<string, number>;
}

export interface BackupNovel extends NovelInfo {
  chapters: ChapterInfo[];
}

export interface BackupCategory extends Category {
  novelIds: number[];
}
