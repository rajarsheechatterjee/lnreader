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
} from '@screens/library/constants/constants';
import { useBoolean } from '@hooks';
import { Appbar, List } from '@components';
import NovelBadgesModal from './modals/NovelBadgesModal';
import { NavigationState } from '@react-navigation/native';
import { getString } from '@strings/translations';
import SettingSwitch from '../components/SettingSwitch';

interface GenralSettingsProps {
  navigation: NavigationState;
}

const GenralSettings: React.FC<GenralSettingsProps> = ({ navigation }) => {
  const theme = useTheme();

  const {
    displayMode = DisplayModes.Comfortable,
    novelsPerRow = 3,
    showDownloadBadges = true,
    showNumberOfNovels = false,
    showUnreadBadges = true,
  } = useLibrarySettings();

  const {
    disableLoadingAnimations,
    updateLibraryOnLaunch,
    downloadNewChapters,
    onlyUpdateOngoingNovels,
    defaultChapterSort,
    refreshNovelMetadata,
    disableHapticFeedback,
    useLibraryFAB,
    setAppSettings,
  } = useAppSettings();

  const { showLastUpdateTime, setShowLastUpdateTime } = useLastUpdate();

  const generateNovelBadgesDescription = () => {
    let res = [];
    if (showDownloadBadges) {
      res.push(getString('libraryScreen.bottomSheet.display.download'));
    }
    if (showUnreadBadges) {
      res.push(getString('libraryScreen.bottomSheet.display.unread'));
    }
    if (showNumberOfNovels) {
      res.push(getString('libraryScreen.bottomSheet.display.numberOfItems'));
    }
    return res.join(', ');
  };

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
  const novelBadgesDescription = generateNovelBadgesDescription();
  /**
   * Chapter Sort Modal
   */
  const defaultChapterSortModal = useBoolean();
  return (
    <>
      <Appbar
        title={getString('generalSettings')}
        // @ts-ignore
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <List.Section>
          <List.SubHeader theme={theme}>
            {getString('common.display')}
          </List.SubHeader>
          <List.Item
            title={getString('generalSettingsScreen.displayMode')}
            description={displayModesList[displayMode].label}
            onPress={displayModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString('generalSettingsScreen.itemsPerRowLibrary')}
            description={
              novelsPerRow +
              ' ' +
              getString('generalSettingsScreen.itemsPerRow')
            }
            onPress={gridSizeModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString('generalSettingsScreen.novelBadges')}
            // @ts-ignore
            description={novelBadgesDescription}
            onPress={novelBadgesModalRef.setTrue}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>{getString('library')}</List.SubHeader>
          <SettingSwitch
            label={getString('generalSettingsScreen.updateLibrary')}
            description={getString('generalSettingsScreen.updateLibraryDesc')}
            value={updateLibraryOnLaunch}
            onPress={() =>
              setAppSettings({ updateLibraryOnLaunch: !updateLibraryOnLaunch })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.useFAB')}
            value={useLibraryFAB}
            onPress={() => setAppSettings({ useLibraryFAB: !useLibraryFAB })}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettingsScreen.novel')}
          </List.SubHeader>
          <List.Item
            title={getString('generalSettingsScreen.chapterSort')}
            description={`${getString('generalSettingsScreen.bySource')} ${
              defaultChapterSort === 'ORDER BY position ASC'
                ? getString('generalSettingsScreen.asc')
                : getString('generalSettingsScreen.desc')
            }`}
            onPress={defaultChapterSortModal.setTrue}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettingsScreen.globalUpdate')}
          </List.SubHeader>
          <SettingSwitch
            label={getString('generalSettingsScreen.updateOngoing')}
            value={onlyUpdateOngoingNovels}
            onPress={() =>
              setAppSettings({
                onlyUpdateOngoingNovels: !onlyUpdateOngoingNovels,
              })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.refreshMetadata')}
            description={getString(
              'generalSettingsScreen.refreshMetadataDescription',
            )}
            value={refreshNovelMetadata}
            onPress={() =>
              setAppSettings({ refreshNovelMetadata: !refreshNovelMetadata })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.updateTime')}
            value={showLastUpdateTime}
            onPress={() => setShowLastUpdateTime(!showLastUpdateTime)}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettingsScreen.autoDownload')}
          </List.SubHeader>
          <SettingSwitch
            label={getString('generalSettingsScreen.downloadNewChapters')}
            value={downloadNewChapters}
            onPress={() =>
              setAppSettings({ downloadNewChapters: !downloadNewChapters })
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettings')}
          </List.SubHeader>
          <SettingSwitch
            label={getString('generalSettingsScreen.disableHapticFeedback')}
            description={getString(
              'generalSettingsScreen.disableHapticFeedbackDescription',
            )}
            value={disableHapticFeedback}
            onPress={() =>
              setAppSettings({ disableHapticFeedback: !disableHapticFeedback })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.disableLoadingAnimations')}
            description={getString(
              'generalSettingsScreen.disableLoadingAnimationsDesc',
            )}
            value={disableLoadingAnimations}
            onPress={() =>
              setAppSettings({
                disableLoadingAnimations: !disableLoadingAnimations,
              })
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>
      <DisplayModeModal
        displayMode={displayMode}
        displayModalVisible={displayModalRef.value}
        hideDisplayModal={displayModalRef.setFalse}
        theme={theme}
      />
      <DefaultChapterSortModal
        defaultChapterSort={defaultChapterSort}
        displayModalVisible={defaultChapterSortModal.value}
        hideDisplayModal={defaultChapterSortModal.setFalse}
        setAppSettings={setAppSettings}
        theme={theme}
      />
      <GridSizeModal
        novelsPerRow={novelsPerRow}
        gridSizeModalVisible={gridSizeModalRef.value}
        hideGridSizeModal={gridSizeModalRef.setFalse}
        theme={theme}
      />
      <NovelBadgesModal
        novelBadgesModalVisible={novelBadgesModalRef.value}
        hideNovelBadgesModal={novelBadgesModalRef.setFalse}
        theme={theme}
      />
    </>
  );
};

export default GenralSettings;
