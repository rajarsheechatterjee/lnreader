import {
  ChapterSortOrder,
  DisplayModes,
  LibrarySortOrder,
  badgesList,
  chapterSortOrderList,
  displayModesList,
  gridSizeList,
  librarySortOrderList,
} from '@screens/library/constants/constants';
import { getString } from '@strings/translations';
import { generalIds, SettingsGroup } from '../Settings.d';

const sortOrderNameMap = new Map<string, string>([
  ['name', 'libraryScreen.bottomSheet.sortOrders.alphabetically'],
  ['chaptersDownloaded', 'libraryScreen.bottomSheet.sortOrders.download'],
  ['chaptersUnread', 'libraryScreen.bottomSheet.sortOrders.totalChapters'],
  ['id', 'libraryScreen.bottomSheet.sortOrders.dateAdded'],
  ['lastReadAt', 'libraryScreen.bottomSheet.sortOrders.lastRead'],
  ['lastUpdatedAt', 'libraryScreen.bottomSheet.sortOrders.lastUpdated'],
]);

const GeneralSettings: SettingsGroup<generalIds> = {
  groupTitle: getString('generalSettings'),
  icon: 'tune',
  navigateParam: 'GeneralSettings',
  subGroup: [
    {
      subGroupTitle: getString('common.display'),
      id: 'display',
      settings: [
        {
          title: getString('generalSettingsScreen.displayMode'),
          description: val => displayModesList[val].label,
          type: 'Modal',
          settingOrigin: 'Library',

          mode: 'single',
          valueKey: 'displayMode',
          defaultValue: DisplayModes.Comfortable,
          options: displayModesList,
        },
        {
          title: getString('generalSettingsScreen.itemsPerRowLibrary'),
          type: 'Modal',
          settingOrigin: 'Library',
          description: val =>
            ''.concat(
              val + 1 + ' ' + getString('generalSettingsScreen.itemsPerRow'),
            ),

          mode: 'single',
          valueKey: 'novelsPerRow',
          defaultValue: 3,
          options: gridSizeList,
        },
        {
          title: getString('generalSettingsScreen.novelBadges'),
          type: 'Modal',
          settingOrigin: 'Library',
          description: val =>
            badgesList
              .filter((v, i) => {
                return val[i];
              })
              .map(v => v.label)
              .join(', '),

          mode: 'multiple',
          valueKey: [
            'showDownloadBadges',
            'showNumberOfNovels',
            'showUnreadBadges',
          ],
          defaultValue: [true, false, true],
          options: badgesList,
        },
        {
          title: getString('generalSettingsScreen.novelSort'),
          type: 'Modal',
          settingOrigin: 'Library',
          description: val => {
            const v = val.split(' ');
            //@ts-expect-error
            return getString(sortOrderNameMap.get(v[0])) + ' ' + v[1];
          },
          mode: 'order',
          valueKey: 'sortOrder',
          defaultValue: LibrarySortOrder.DateAdded_DESC,
          options: librarySortOrderList,
        },
      ],
    },
    {
      subGroupTitle: getString('library'),
      id: 'library',
      settings: [
        {
          title: getString('generalSettingsScreen.updateLibrary'),
          description: getString('generalSettingsScreen.updateLibraryDesc'),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'updateLibraryOnLaunch',
          defaultValue: false,
        },
        {
          title: getString('generalSettingsScreen.useFAB'),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'useLibraryFAB',
          defaultValue: false,
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.novel'),
      id: 'novel',
      settings: [
        {
          title: getString('generalSettingsScreen.chapterSort'),
          type: 'Modal',
          settingOrigin: 'App',
          description: val =>
            `${getString('generalSettingsScreen.bySource')} ${
              val === 'ORDER BY position ASC'
                ? getString('generalSettingsScreen.asc')
                : getString('generalSettingsScreen.desc')
            }`,
          mode: 'order',
          valueKey: 'defaultChapterSort',
          defaultValue: ChapterSortOrder.BySource_DESC,
          options: chapterSortOrderList,
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.globalUpdate'),
      id: 'globalUpdate',
      settings: [
        {
          title: getString('generalSettingsScreen.updateOngoing'),
          type: 'Switch',
          settingOrigin: 'App',

          valueKey: 'onlyUpdateOngoingNovels',
          defaultValue: true,
        },
        {
          title: getString('generalSettingsScreen.refreshMetadata'),
          description: getString(
            'generalSettingsScreen.refreshMetadataDescription',
          ),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'refreshNovelMetadata',
          defaultValue: false,
        },
        {
          title: getString('generalSettingsScreen.updateTime'),
          type: 'Switch',
          settingOrigin: 'lastUpdateTime',
          valueKey: 'showLastUpdateTime',
          defaultValue: true,
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.autoDownload'),
      id: 'autoDownload',
      settings: [
        {
          title: getString('generalSettingsScreen.downloadNewChapters'),
          type: 'Switch',
          settingOrigin: 'App',

          valueKey: 'downloadNewChapters',
          defaultValue: false,
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettings'),
      id: 'general',
      settings: [
        {
          title: getString('generalSettingsScreen.disableHapticFeedback'),
          type: 'Switch',
          settingOrigin: 'App',

          valueKey: 'disableHapticFeedback',
          defaultValue: false,
        },
      ],
    },
  ],
} as const;
export default GeneralSettings;
