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
import { SettingsGroup } from '../Settings';

const GeneralSettings: SettingsGroup = {
  groupTitle: getString('generalSettings'),
  icon: 'tune',
  navigateParam: 'GeneralSettings',
  subGroup: [
    {
      subGroupTitle: getString('common.display'),
      settings: [
        {
          title: getString('generalSettingsScreen.displayMode'),
          // description: () displayModesList[displayMode].label
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

          mode: 'single',
          valueKey: 'novelsPerRow',
          defaultValue: 3,
          options: gridSizeList,
        },
        {
          title: getString('generalSettingsScreen.novelBadges'),
          type: 'Modal',
          settingOrigin: 'Library',

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

          mode: 'order',
          valueKey: 'sortOrder',
          defaultValue: LibrarySortOrder.DateAdded_DESC,
          options: librarySortOrderList,
        },
      ],
    },
    {
      subGroupTitle: getString('library'),
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
      settings: [
        {
          title: getString('generalSettingsScreen.chapterSort'),
          type: 'Modal',
          settingOrigin: 'App',

          mode: 'order',
          valueKey: 'defaultChapterSort',
          defaultValue: ChapterSortOrder.BySource_DESC,
          options: chapterSortOrderList,
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.globalUpdate'),
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
        //TODO Add Show last update time
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.autoDownload'),
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
