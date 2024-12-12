import BackgroundService from 'react-native-background-actions';

import {
  getLibraryWithCategory,
  getLibraryNovelsFromDb,
} from '../../database/queries/LibraryQueries';

import { showToast } from '../../utils/showToast';
import { UpdateNovelOptions, updateNovel } from './LibraryUpdateQueries';
import { LibraryNovelInfo } from '@database/types';
import { sleep } from '@utils/sleep';
import { MMKVStorage, getMMKVObject } from '@utils/mmkv/mmkv';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import dayjs from 'dayjs';
import { APP_SETTINGS, AppSettings } from '@hooks/persisted/useSettings';

const updateLibrary = async (categoryId?: number) => {
  const { downloadNewChapters, refreshNovelMetadata, onlyUpdateOngoingNovels } =
    getMMKVObject<AppSettings>(APP_SETTINGS) || {};
  const options: UpdateNovelOptions = {
    downloadNewChapters: downloadNewChapters || false,
    refreshNovelMetadata: refreshNovelMetadata || false,
  };

  let libraryNovels: LibraryNovelInfo[] = [];
  if (categoryId) {
    libraryNovels = getLibraryWithCategory({
      filter:
        `categoryId = ${categoryId}` +
        (onlyUpdateOngoingNovels ? " AND status = 'Ongoing'" : ''),
    });
  } else {
    libraryNovels = getLibraryNovelsFromDb(
      onlyUpdateOngoingNovels,
    ) as LibraryNovelInfo[];
  }

  if (libraryNovels.length > 0) {
    MMKVStorage.set(LAST_UPDATE_TIME, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    for (let i = 0; i < libraryNovels.length; i++) {
      try {
        await updateNovel(
          libraryNovels[i].pluginId,
          libraryNovels[i].path,
          libraryNovels[i].id,
          options,
        );
        /**
         * Update notification
         */
        await BackgroundService.updateNotification({
          taskTitle: '(' + (i + 1) + '/' + libraryNovels.length + ')',
          taskDesc: libraryNovels[i].name,
          progressBar: { max: libraryNovels.length, value: i + 1 },
        });
        await sleep(1000);
      } catch (error: any) {
        showToast(libraryNovels[i].name + ': ' + error.message);
        continue;
      }
    }
  } else {
    showToast("There's no novel to be updated");
  }
};

export { updateLibrary };
