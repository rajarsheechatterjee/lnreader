import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import BackgroundService from 'react-native-background-actions';

import { getPlugin } from '@plugins/pluginManager';
import { restoreLibrary } from '@database/queries/NovelQueries';
import { getLibraryNovelsFromDb } from '@database/queries/LibraryQueries';
import { showToast } from '@utils/showToast';
import dayjs from 'dayjs';
import { NovelInfo } from '@database/types';
import { sleep } from '@utils/sleep';
import { getString } from '@strings/translations';
import * as FileSystem from 'expo-file-system';

export const createBackup = async () => {
  try {
    const novels = getLibraryNovelsFromDb();

    const datetime = dayjs().format('YYYY-MM-DD_HH_mm');
    const fileName = 'lnreader_backup_' + datetime + '.json';
    const fileContent = JSON.stringify(novels);
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      showToast(getString('backupScreen.legacy.permissionDenied'));
      return;
    }
    const directoryUri = permissions.directoryUri;
    await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName,
      'application/json',
    )
      .then(async uri => {
        await FileSystem.writeAsStringAsync(uri, fileContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        showToast(getString('backupScreen.legacy.backupCreated', { fileName }));
      })
      .catch(error => {
        showToast(
          getString('backupScreen.legacy.failedToSave', {
            message: error.message,
          }),
        );
      });
  } catch (error: any) {
    showToast(error.message);
  } finally {
    BackgroundService.stop();
  }
};

interface TaskData {
  delay: number;
}

export const restoreBackup = async () => {
  try {
    const backup = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });
    let novelsString = '';

    if (backup.assets && backup.assets[0]) {
      novelsString = await FileSystem.StorageAccessFramework.readAsStringAsync(
        backup.assets[0].uri,
      );
    }
    const novels: NovelInfo[] = await JSON.parse(novelsString);
    if (novels.length === 0) {
      showToast(getString('backupScreen.legacy.noAvailableBackup'));
      return;
    }
    const notificationOptions = {
      taskName: 'Backup Restore',
      taskTitle: getString('backupScreen.restorinBackup'),
      taskDesc: '(0/' + novels.length + ')',
      taskIcon: { name: 'notification_icon', type: 'drawable' },
      color: '#00adb5',
      parameters: { delay: 1000 },
      linkingURI: 'lnreader://updates',
      progressBar: { max: novels.length, value: 0 },
    };

    const restoreBackupBackgroundAction = async (taskData?: TaskData) => {
      let errorString = '';
      let restoredNovelsCount = 0;
      for (let i = 0; BackgroundService.isRunning() && i < novels.length; i++) {
        try {
          if (BackgroundService.isRunning()) {
            const plugin = getPlugin(novels[i].pluginId);
            if (!plugin) {
              throw new Error(`No plugin found with id ${novels[i].pluginId}`);
            }
            BackgroundService.updateNotification({
              taskTitle: novels[i].name,
              taskDesc: '(' + (i + 1) + '/' + novels.length + ')',
              progressBar: { max: novels.length, value: i + 1 },
            });
            await restoreLibrary(novels[i]);
            restoredNovelsCount += 1;
            const nextNovelIndex = i + 1;

            if (
              nextNovelIndex in novels &&
              novels[nextNovelIndex].pluginId === novels[i].pluginId
            ) {
              await sleep(taskData?.delay || 0);
            }
          }
        } catch (e) {
          errorString += e + '\n';
        }
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getString('backupScreen.legacy.libraryRestored'),
          body:
            getString('backupScreen.legacy.novelsRestored', {
              num: restoredNovelsCount,
            }) +
            '\n' +
            errorString,
        },
        trigger: null,
      });
      BackgroundService.stop();
    };

    if (novels.length > 0) {
      await BackgroundService.start<TaskData>(
        restoreBackupBackgroundAction,
        notificationOptions,
      );
    }
  } catch (error: any) {
    showToast(error.message);
  }
};
