import { useState } from 'react';
import {
  getDetailedUpdatesFromDb,
  getUpdatedOverviewFromDb,
} from '@database/queries/ChapterQueries';

import { Update, UpdateOverview } from '@database/types';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import dayjs from 'dayjs';
import { parseChapterNumber } from '@utils/parseChapterNumber';

export const SHOW_LAST_UPDATE_TIME = 'SHOW_LAST_UPDATE_TIME';
export const LAST_UPDATE_TIME = 'LAST_UPDATE_TIME';

export const useLastUpdate = () => {
  const [showLastUpdateTime = true, setShowLastUpdateTime] = useMMKVBoolean(
    SHOW_LAST_UPDATE_TIME,
  );
  const [lastUpdateTime, setLastUpdateTime] = useMMKVString(LAST_UPDATE_TIME);
  return {
    lastUpdateTime,
    showLastUpdateTime,
    setLastUpdateTime,
    setShowLastUpdateTime,
  };
};

export const useUpdates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [updatesOverview, setUpdatesOverview] = useState<UpdateOverview[]>([]);

  const { lastUpdateTime, showLastUpdateTime, setLastUpdateTime } =
    useLastUpdate();
  const [error, setError] = useState('');

  const getDetailedUpdates = async (
    novelId: number,
    onlyDownloadedChapters: boolean = false,
  ) => {
    setIsLoading(true);

    let result: Update[] = await getDetailedUpdatesFromDb(
      novelId,
      onlyDownloadedChapters,
    );
    result = result.map(update => {
      const parsedTime = dayjs(update.releaseTime);
      return {
        ...update,
        releaseTime: parsedTime.isValid()
          ? parsedTime.format('LL')
          : update.releaseTime,
        chapterNumber: update.chapterNumber
          ? update.chapterNumber
          : parseChapterNumber(update.novelName, update.name),
      };
    });
    setIsLoading(false);
    return result;
  };

  const getUpdates = () => {
    setIsLoading(true);
    getUpdatedOverviewFromDb()
      .then(res => {
        setUpdatesOverview(res);
        if (res.length) {
          if (
            !lastUpdateTime ||
            dayjs(lastUpdateTime).isBefore(dayjs(res[0].updateDate))
          ) {
            setLastUpdateTime(res[0].updateDate);
          }
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  return {
    isLoading,
    updatesOverview,
    getUpdates,
    getDetailedUpdates,
    lastUpdateTime,
    showLastUpdateTime,
    error,
  };
};
