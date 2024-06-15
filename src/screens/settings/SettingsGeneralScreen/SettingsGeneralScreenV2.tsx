import React from 'react';
import { ScrollView } from 'react-native';

import DisplayModeModal from './modals/DisplayModeModal';
import GridSizeModal from './modals/GridSizeModal';

import {
  useAppSettings,
  useLastUpdate,
  useLibrarySettings,
  useTheme,
} from '@hooks/persisted';
import DefaultChapterSortModal from '../components/DefaultChapterSortModal';
import {
  DisplayModes,
  displayModesList,
  LibrarySortOrder,
} from '@screens/library/constants/constants';
import { useBoolean } from '@hooks';
import { Appbar, List } from '@components';
import NovelSortModal from './modals/NovelSortModal';
import NovelBadgesModal from './modals/NovelBadgesModal';
import { NavigationState } from '@react-navigation/native';
import { getString } from '@strings/translations';
import SettingSwitch from '../components/SettingSwitch';
import S from '../Settings';
import DefaultSettingModal from './modals/DefaultSettingModal';
import useUpdateSettingsFn from './utils/useUpdateSettingsFn';
import SettingSwitchV2 from '../components/SettingSwitchV2';

interface GenralSettingsProps {
  navigation: NavigationState;
}

const GenralSettings: React.FC<GenralSettingsProps> = ({ navigation }) => {
  const theme = useTheme();
  const Settings = S.general;

  const { setLibrarySettings, ...librarySettings } = useLibrarySettings();

  // const sortOrderDisplay: string[] = sortOrder.split(' ');
  const sortOrderNameMap = new Map<string, string>([
    ['name', 'libraryScreen.bottomSheet.sortOrders.alphabetically'],
    ['chaptersDownloaded', 'libraryScreen.bottomSheet.sortOrders.download'],
    ['chaptersUnread', 'libraryScreen.bottomSheet.sortOrders.totalChapters'],
    ['id', 'libraryScreen.bottomSheet.sortOrders.dateAdded'],
    ['lastReadAt', 'libraryScreen.bottomSheet.sortOrders.lastRead'],
    ['lastUpdatedAt', 'libraryScreen.bottomSheet.sortOrders.lastUpdated'],
  ]);
  const appSettings = useAppSettings();

  const { showLastUpdateTime, setShowLastUpdateTime } = useLastUpdate();

  // const generateNovelBadgesDescription = () => {
  //   let res = [];
  //   if (showDownloadBadges) {
  //     res.push(getString('libraryScreen.bottomSheet.display.download'));
  //   }
  //   if (showUnreadBadges) {
  //     res.push(getString('libraryScreen.bottomSheet.display.unread'));
  //   }
  //   if (showNumberOfNovels) {
  //     res.push(getString('libraryScreen.bottomSheet.display.numberOfItems'));
  //   }
  //   return res.join(', ');
  // };

  /**
   * Display Mode Modal
   */
  const displayModalRef = useBoolean();

  /**
   * Grid Size Modal
   */
  const gridSizeModalRef = useBoolean();

  /**
   * Novel Badges Modal
   */
  const novelBadgesModalRef = useBoolean();
  // const novelBadgesDescription = generateNovelBadgesDescription();
  /**
   * Novel Sort Modal
   */
  const novelSortModalRef = useBoolean();
  /**
   * Chapter Sort Modal
   */
  const defaultChapterSortModal = useBoolean();

  return (
    <>
      <Appbar
        title={Settings.groupTitle}
        // @ts-ignore
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <List.Section>
          {Settings.subGroup.map((setting, index) => {
            return (
              <>
                {index === 0 ? null : <List.Divider theme={theme} />}
                <List.SubHeader key={'subHeader' + index} theme={theme}>
                  {setting.subGroupTitle}
                </List.SubHeader>
                {setting.settings.map((settingOption, i) => {
                  if (settingOption.type === 'Modal') {
                    return (
                      <DefaultSettingModal
                        key={'settingOption' + index + i}
                        setting={settingOption}
                        theme={theme}
                      />
                    );
                  } else if (settingOption.type === 'Switch') {
                    return (
                      <SettingSwitchV2
                        key={'settingOption' + index + i}
                        setting={settingOption}
                        theme={theme}
                      />
                    );
                  }
                })}
              </>
            );
          })}
        </List.Section>
      </ScrollView>
    </>
  );
};

export default GenralSettings;
