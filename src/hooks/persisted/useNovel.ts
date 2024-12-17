import { SearchResult, UserListEntry } from '@services/Trackers';
import { useMMKVNumber, useMMKVObject } from 'react-native-mmkv';
import { TrackerMetadata, getTracker } from './useTracker';
import { ChapterInfo, NovelInfo } from '@database/types';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import {
  getNovelByPath,
  deleteCachedNovels as _deleteCachedNovels,
  getCachedNovels as _getCachedNovels,
  insertNovelAndChapters,
  switchNovelToLibrary,
} from '@database/queries/NovelQueries';
import {
  bookmarkChapter as _bookmarkChapter,
  markChapterRead as _markChapterRead,
  markChaptersRead as _markChaptersRead,
  markPreviuschaptersRead as _markPreviuschaptersRead,
  markPreviousChaptersUnread as _markPreviousChaptersUnread,
  markChaptersUnread as _markChaptersUnread,
  deleteChapter as _deleteChapter,
  deleteChapters as _deleteChapters,
  getPageChapters as _getPageChapters,
  insertChapters,
  getCustomPages,
} from '@database/queries/ChapterQueries';
import { fetchNovel, fetchPage } from '@services/plugin/fetch';
import { showToast } from '@utils/showToast';
import { useCallback, useEffect, useState } from 'react';
import { getString } from '@strings/translations';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';
import { NOVEL_STORAGE } from '@utils/Storages';
import FileManager from '@native/FileManager';
import { useAppSettings } from './useSettings';

// store key: '<PREFIX>_<novel.pluginId>_<novel.path>',
// store key: '<PREFIX>_<novel.id>',

export const TRACKED_NOVEL_PREFIX = 'TRACKED_NOVEL_PREFIX';

export const NOVEL_PAGE_INDEX_PREFIX = 'NOVEL_PAGE_INDEX_PREFIX';
export const NOVEL_SETTINSG_PREFIX = 'NOVEL_SETTINGS';
export const LAST_READ_PREFIX = 'LAST_READ_PREFIX';

type TrackedNovel = SearchResult & UserListEntry;

export interface NovelSettings {
  sort?: string;
  filter?: string;
  showChapterTitles?: boolean;
}

const defaultNovelSettings: NovelSettings = {
  showChapterTitles: true,
};
const defaultPageIndex = 0;

export const useTrackedNovel = (novelId: number) => {
  const [trackedNovel, setValue] = useMMKVObject<TrackedNovel>(
    `${TRACKED_NOVEL_PREFIX}_${novelId}`,
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
  const [loading, setLoading] = useState(true);
  const [novel, setNovel] = useState<NovelInfo>();
  const [chapters, _setChapters] = useState<ChapterInfo[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const setChapters = useCallback(
    (chapters: ChapterInfo[]) => {
      if (novel) {
        _setChapters(
          chapters.map(chapter => {
            const parsedTime = dayjs(chapter.releaseTime);
            return {
              ...chapter,
              releaseTime: parsedTime.isValid()
                ? parsedTime.format('LL')
                : chapter.releaseTime,
              chapterNumber: chapter.chapterNumber
                ? chapter.chapterNumber
                : parseChapterNumber(novel.name, chapter.name),
            };
          }),
        );
      }
    },
    [novel, _setChapters],
  );
  const [pageIndex = defaultPageIndex, setPageIndex] = useMMKVNumber(`
    ${NOVEL_PAGE_INDEX_PREFIX}_${pluginId}_${novelPath}
  `);
  const [lastRead, setLastRead] = useMMKVObject<ChapterInfo>(
    `${LAST_READ_PREFIX}_${pluginId}_${novelPath}`,
  );
  const [novelSettings = defaultNovelSettings, setNovelSettings] =
    useMMKVObject<NovelSettings>(
      `${NOVEL_SETTINSG_PREFIX}_${pluginId}_${novelPath}`,
    );

  const { defaultChapterSort } = useAppSettings();

  const sort = novelSettings.sort || defaultChapterSort;

  const openPage = useCallback((index: number) => {
    setPageIndex(index);
  }, []);

  const refreshChapters = useCallback(() => {
    if (novel) {
      _getPageChapters(
        novel.id,
        sort,
        novelSettings.filter,
        pages[pageIndex],
      ).then(chapters => setChapters(chapters));
    }
  }, [novel, pageIndex, sort, novelSettings]);

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
      _bookmarkChapter(_chapter.id);
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
    const chapterIds = _chapters.map(chapter => chapter.id);
    _markChaptersRead(chapterIds);

    setChapters(
      chapters.map(chapter => {
        if (chapterIds.includes(chapter.id)) {
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
    const chapterIds = _chapters.map(chapter => chapter.id);
    _markChaptersUnread(chapterIds);

    setChapters(
      chapters.map(chapter => {
        if (chapterIds.includes(chapter.id)) {
          return {
            ...chapter,
            unread: true,
          };
        }
        return chapter;
      }),
    );
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
    [novel, chapters],
  );

  const getNovel = useCallback(async () => {
    let novel = await getNovelByPath(novelPath, pluginId);
    if (!novel) {
      const sourceNovel = await fetchNovel(pluginId, novelPath).catch(() => {
        throw new Error(getString('updatesScreen.unableToGetNovel'));
      });
      await insertNovelAndChapters(pluginId, sourceNovel);
      novel = await getNovelByPath(novelPath, pluginId);
      if (!novel) {
        return;
      }
    }
    let pages: string[];
    if (novel.totalPages > 0) {
      pages = Array(novel.totalPages)
        .fill(0)
        .map((_, idx) => String(idx + 1));
    } else {
      pages = (await getCustomPages(novel.id)).map(c => c.page);
    }
    if (pages.length) {
      setPages(pages);
    } else {
      setPages(['1']);
    }
    setNovel(novel);
    setLoading(false);
  }, []);

  const getChapters = useCallback(async () => {
    const page = pages[pageIndex];
    if (novel && page) {
      let chapters =
        (await _getPageChapters(
          novel.id,
          sort,
          novelSettings.filter,
          page,
        ).catch(e => console.log('error', e))) || [];

      if (!chapters.length && Number(page)) {
        const sourcePage = await fetchPage(pluginId, novelPath, page);

        const sourceChapters = sourcePage.chapters.map(ch => {
          return {
            ...ch,
            page,
          };
        });
        await insertChapters(novel.id, sourceChapters);
        chapters = await _getPageChapters(
          novel.id,
          sort,
          novelSettings.filter,
          page,
        );
      }
      setChapters(chapters);
    }
  }, [novel, novelSettings, pageIndex]);

  useEffect(() => {
    getNovel();
  }, []);

  useEffect(() => {
    getChapters().catch(e => showToast(e.message));
  }, [getChapters]);

  return {
    loading,
    pageIndex,
    pages,
    novel,
    lastRead,
    chapters,
    novelSettings,
    getNovel,
    setPageIndex,
    openPage,
    setNovel,
    setLastRead,
    sortAndFilterChapters,
    followNovel,
    bookmarkChapters,
    markPreviouschaptersRead,
    markChaptersRead,
    markPreviousChaptersUnread,
    markChaptersUnread,
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
    MMKVStorage.delete(`${TRACKED_NOVEL_PREFIX}_${novel.id}`);
    MMKVStorage.delete(
      `${NOVEL_PAGE_INDEX_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(
      `${NOVEL_SETTINSG_PREFIX}_${novel.pluginId}_${novel.path}`,
    );
    MMKVStorage.delete(`${LAST_READ_PREFIX}_${novel.pluginId}_${novel.path}`);
    const novelDir = NOVEL_STORAGE + '/' + novel.pluginId + '/' + novel.id;
    if (await FileManager.exists(novelDir)) {
      await FileManager.unlink(novelDir);
    }
  }
  _deleteCachedNovels();
};
