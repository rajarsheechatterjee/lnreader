import { SearchResult, UserListEntry } from '@services/Trackers';
import { useMMKVObject } from 'react-native-mmkv';
import { TrackerMetadata, getTracker } from './useTracker';
import { ChapterInfo, NovelInfo } from '@database/types';
import { MMKVStorage, getMMKVObject } from '@utils/mmkv/mmkv';
import {
  getNovel as _getNovel,
  deleteCachedNovels as _deleteCachedNovels,
  getCachedNovels as _getCachedNovels,
  insertNovelAndChapters,
  switchNovelToLibrary,
} from '@database/queries/NovelQueries';
import {
  bookmarkChapter as _bookmarkChapter,
  markChapterRead as _markChapterRead,
  markPreviuschaptersRead as _markPreviuschaptersRead,
  markPreviousChaptersUnread as _markPreviousChaptersUnread,
  markChapterUnread as _markChapterUnread,
  deleteChapter as _deleteChapter,
  deleteChapters as _deleteChapters,
  getChapters as _getChapters,
  insertChapters,
  getCustomPages,
} from '@database/queries/ChapterQueries';
import { fetchNovel, fetchPage } from '@services/plugin/fetch';
import { updateNovel as _updateNovel } from '@services/updates/LibraryUpdateQueries';
import { APP_SETTINGS, AppSettings } from './useSettings';
import { showToast } from '@utils/showToast';
import { useCallback, useEffect } from 'react';
import { NovelDownloadFolder } from '@utils/constants/download';
import * as RNFS from 'react-native-fs';
import { getString } from '@strings/translations';
import { ChapterItem } from '@plugins/types';

// store key: '<PREFIX>_<novel.pluginId>_<novel.path>',

export const TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

export const NOVEL_PREFIX = 'NOVEL_PREFIX';
export const NOVEL_CHAPTERS_PREFIX = 'NOVEL_CHAPTERS_PREFIX';
export const NOVEL_LATEST_CHAPTER_PREFIX = 'NOVEL_LATEST_CHAPTER';
export const NOVEL_PAGES_PREFIX = 'NOVEL_PAGES_PREFIX';
export const NOVEL_SETTINSG_PREFIX = 'NOVEL_SETTINGS';
export const LAST_READ_PREFIX = 'LAST_READ_PREFIX';
export const PROGRESS_PREFIX = 'PROGRESS_PREFIX';

type TrackedNovel = SearchResult & UserListEntry;

interface NovelSettings {
  sort?: string;
  filter?: string;
  showChapterTitles?: boolean;
}

interface ChapterProgress {
  offsetY: number;
  percentage: number;
}

export interface NovelProgress {
  [chapterId: number]: ChapterProgress;
}

export interface NovelPages {
  pages: {
    title: string;
    hasUpdate?: boolean;
  }[];
  current: number; // index
}

export const useTrackedNovel = (pluginId: string, novelPath: string) => {
  const [trackedNovel, setValue] = useMMKVObject<TrackedNovel>(
    `${TRACKED_NOVEL_PREFIX}_${pluginId}_${novelPath}`,
  );

  const trackNovel = (tracker: TrackerMetadata, novel: SearchResult) => {
    getTracker(tracker.name)
      .getUserListEntry(novel.id, tracker.auth)
      .then((data: UserListEntry) => {
        setValue({
          ...novel,
          ...data,
        });
      });
  };

  const untrackNovel = () => setValue(undefined);

  const updateTrackedNovel = (
    tracker: TrackerMetadata,
    data: Partial<UserListEntry>,
  ) => {
    if (!trackedNovel) {
      return;
    }
    return getTracker(tracker.name).updateUserListEntry(
      trackedNovel.id,
      data,
      tracker.auth,
    );
  };

  const updateNovelProgess = (
    tracker: TrackerMetadata,
    chaptersRead: number,
  ) => {
    if (!trackedNovel) {
      return;
    }
    return getTracker(tracker.name).updateUserListEntry(
      trackedNovel.id,
      { progress: chaptersRead },
      tracker.auth,
    );
  };

  return {
    trackedNovel,
    trackNovel,
    untrackNovel,
    updateTrackedNovel,
    updateNovelProgess,
  };
};

export const useNovel = (novelPath: string, pluginId: string) => {
  const [novel, setNovel] = useMMKVObject<NovelInfo>(
    `${NOVEL_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [latestChapter, setLatestChapter] = useMMKVObject<ChapterItem>(
    `${NOVEL_LATEST_CHAPTER_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [novelPages = { pages: [], current: 0 }, setNovelPages] =
    useMMKVObject<NovelPages>(`${NOVEL_PAGES_PREFIX}_${pluginId}_${novelPath}`);
  const [chapters = [], setChapters] = useMMKVObject<ChapterInfo[]>(
    `${NOVEL_CHAPTERS_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [lastRead, setLastRead] = useMMKVObject<ChapterInfo>(
    `${LAST_READ_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [novelSettings = {}, setNovelSettings] = useMMKVObject<NovelSettings>(
    `${NOVEL_SETTINSG_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [progress = {}, _setProgress] = useMMKVObject<NovelProgress>(
    `${PROGRESS_PREFIX}_${pluginId}_${novelPath}`,
  );

  const getNovel = async () => {
    let novel = await _getNovel(novelPath, pluginId);
    if (!novel) {
      const sourceNovel = await fetchNovel(pluginId, novelPath).catch(() => {
        throw new Error(getString('updatesScreen.unableToGetNovel'));
      });
      await insertNovelAndChapters(pluginId, sourceNovel);
      novel = await _getNovel(novelPath, pluginId);
      if (!novel) {
        return;
      }
    }
    let pageList: string[] = [];
    if (novel.totalPages > 0) {
      pageList = Array(novel.totalPages)
        .fill(0)
        .map((v, idx) => String(idx + 1));
    } else {
      pageList = (await getCustomPages(novel.id)).map(n => n.page);
    }
    const pages = pageList.map(title => {
      return {
        title,
        hasUpdate: novelPages.pages.find(p => p.title === title)?.hasUpdate,
      };
    });
    setNovelPages({
      pages: pages,
      current: 0,
    });
    setNovel(novel);
  };

  const openPage = (index: number) => {
    setNovelPages({
      ...novelPages,
      current: index,
    });
  };

  const refreshChapters = () => {
    openPage(novelPages.current);
  };

  const sortAndFilterChapters = async (sort?: string, filter?: string) => {
    if (novel) {
      setNovelSettings({
        showChapterTitles: novelSettings?.showChapterTitles,
        sort,
        filter,
      });
    }
  };

  const setShowChapterTitles = (v: boolean) => {
    setNovelSettings({ ...novelSettings, showChapterTitles: v });
  };

  const followNovel = () => {
    switchNovelToLibrary(novelPath, pluginId).then(() => {
      if (novel) {
        setNovel({
          ...novel,
          inLibrary: !novel?.inLibrary,
        });
      }
    });
  };

  const bookmarkChapters = (_chapters: ChapterInfo[]) => {
    _chapters.map(_chapter => {
      _bookmarkChapter(_chapter.bookmark, _chapter.id);
    });
    setChapters(
      chapters.map(chapter => {
        if (_chapters.some(_c => _c.id === chapter.id)) {
          return {
            ...chapter,
            bookmark: !chapter.bookmark,
          };
        }
        return chapter;
      }),
    );
  };

  const markPreviouschaptersRead = (chapterId: number) => {
    if (novel) {
      _markPreviuschaptersRead(chapterId, novel.id);
      setChapters(
        chapters.map(chapter =>
          chapter.id <= chapterId ? { ...chapter, unread: false } : chapter,
        ),
      );
    }
  };

  const markChapterRead = (chapterId: number) => {
    _markChapterRead(chapterId);
    setChapters(
      chapters.map(c => {
        if (c.id !== chapterId) {
          return c;
        }
        return {
          ...c,
          unread: false,
        };
      }),
    );
  };

  const markChaptersRead = (_chapters: ChapterInfo[]) => {
    _chapters.map(chapter => _markChapterRead(chapter.id));
    setChapters(
      chapters.map(chapter => {
        if (_chapters.some(c => c.id === chapter.id)) {
          return {
            ...chapter,
            unread: false,
          };
        }
        return chapter;
      }),
    );
  };

  const markPreviousChaptersUnread = (chapterId: number) => {
    if (novel) {
      _markPreviousChaptersUnread(chapterId, novel.id);
      setChapters(
        chapters.map(chapter =>
          chapter.id <= chapterId ? { ...chapter, unread: true } : chapter,
        ),
      );
    }
  };

  const markChaptersUnread = (_chapters: ChapterInfo[]) => {
    _chapters.map(chapter => _markChapterUnread(chapter.id));
    setChapters(
      chapters.map(chapter => {
        if (_chapters.some(c => c.id === chapter.id)) {
          return {
            ...chapter,
            unread: true,
          };
        }
        return chapter;
      }),
    );
  };

  const updateNovel = async () => {
    const settings = getMMKVObject<AppSettings>(APP_SETTINGS);
    if (novel) {
      await _updateNovel(pluginId, novelPath, novel.id, {
        downloadNewChapters: settings?.downloadNewChapters,
        refreshNovelMetadata: settings?.refreshNovelMetadata,
      }).then(() => {
        getNovel();
      });
    }
  };

  const deleteChapter = (_chapter: ChapterInfo) => {
    if (novel) {
      _deleteChapter(novel.pluginId, novel.id, _chapter.id).then(() => {
        setChapters(
          chapters.map(chapter => {
            if (chapter.id !== _chapter.id) {
              return chapter;
            }
            return {
              ...chapter,
              isDownloaded: false,
            };
          }),
        );
        showToast(getString('common.deleted', { name: _chapter.name }));
      });
    }
  };

  const deleteChapters = useCallback(
    (_chaters: ChapterInfo[]) => {
      if (novel) {
        _deleteChapters(novel.pluginId, novel.id, _chaters).then(() => {
          showToast(
            getString('updatesScreen.deletedChapters', {
              num: _chaters.length,
            }),
          );
          setChapters(
            chapters.map(chapter => {
              if (_chaters.some(_c => _c.id === chapter.id)) {
                return {
                  ...chapter,
                  isDownloaded: false,
                };
              }
              return chapter;
            }),
          );
        });
      }
    },
    [novel],
  );

  const setProgress = (
    chapterId: number,
    offsetY: number,
    percentage: number,
  ) => {
    _setProgress({
      ...progress,
      [chapterId]: {
        offsetY,
        percentage,
      },
    });
  };

  useEffect(() => {
    const getChapters = async () => {
      if (novel) {
        const page = novelPages.pages[novelPages.current]?.title;
        const hasUpdate = novelPages.pages[novelPages.current]?.hasUpdate;
        let chapters = await _getChapters(
          novel.id,
          novelSettings.sort,
          novelSettings.filter,
          page,
        );
        if (novel.totalPages <= 0 || (chapters.length && !hasUpdate)) {
          setChapters(chapters);
        } else {
          const sourcePage = await fetchPage(pluginId, novelPath, page);
          const sourceChapters = sourcePage.chapters.map(ch => {
            return {
              ...ch,
              page,
            };
          });
          await insertChapters(novel.id, sourceChapters);
          if (sourcePage.latestChapter) {
            if (sourcePage.latestChapter.path !== latestChapter?.path) {
              setLatestChapter(sourcePage.latestChapter);
              setNovelPages({
                ...novelPages,
                pages: novelPages.pages.map(p => {
                  if (p.title !== page) {
                    return {
                      ...p,
                      hasUpdate: true,
                    };
                  }
                  return p;
                }),
              });
            }
          }
          chapters = await _getChapters(
            novel.id,
            novelSettings.sort,
            novelSettings.filter,
            page,
          );
          setChapters(chapters);
        }
      }
    };
    getChapters();
  }, [novel, novelSettings, novelPages]);

  return {
    novelPages,
    progress,
    novel,
    lastRead,
    chapters,
    novelSettings,
    setProgress,
    getNovel,
    openPage,
    setNovel,
    setLastRead,
    setNovelSettings,
    sortAndFilterChapters,
    followNovel,
    bookmarkChapters,
    markPreviouschaptersRead,
    markChaptersRead,
    markPreviousChaptersUnread,
    markChaptersUnread,
    updateNovel,
    setShowChapterTitles,
    markChapterRead,
    refreshChapters,
    deleteChapter,
    deleteChapters,
  };
};

export const deleteCachedNovels = async () => {
  const cachedNovels = await _getCachedNovels();
  for (let novel of cachedNovels) {
    MMKVStorage.delete(
      `${TRACKED_NOVEL_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(`${NOVEL_PREFIX}_${novel.pluginId}_${novel.path}`);
    MMKVStorage.delete(`${NOVEL_PAGES_PREFIX}_${novel.pluginId}_${novel.path}`);
    MMKVStorage.delete(
      `${NOVEL_CHAPTERS_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(
      `${NOVEL_SETTINSG_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(`${LAST_READ_PREFIX}_${novel.pluginId}_${novel.path}`);
    MMKVStorage.delete(`${PROGRESS_PREFIX}_${novel.pluginId}_${novel.path}`);
    const novelDir =
      NovelDownloadFolder + '/' + novel.pluginId + '/' + novel.id;
    if (await RNFS.exists(novelDir)) {
      await RNFS.unlink(novelDir);
    }
  }
  _deleteCachedNovels();
};
