import React, { useState } from 'react';
import { StyleSheet, FlatList, Text, View, FlatListProps } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import GlobalSearchNovelCover from '../globalsearch/GlobalSearchNovelCover';

import { migrateNovel } from '@services/migrate/migrateNovel';
import { showToast } from '@utils/showToast';

import { Button } from '@components';
import { getString } from '@strings/translations';
import { MigrateNovelScreenProps } from '@navigators/types';
import { NovelInfo } from '@database/types';
import { ThemeColors } from '@theme/types';
import { SourceSearchResult } from './MigrationNovels';
import { NovelItem } from '@plugins/types';

interface MigrationNovelListProps {
  data: SourceSearchResult;
  fromNovel: NovelInfo;
  theme: ThemeColors;
  library: NovelInfo[];
  navigation: MigrateNovelScreenProps['navigation'];
}

interface SelectedNovel {
  url: string;
  name: string;
}

const MigrationNovelList = ({
  data,
  fromNovel,
  theme,
  library,
  navigation,
}: MigrationNovelListProps) => {
  const pluginId = data.id;
  const [selectedNovel, setSelectedNovel] = useState<SelectedNovel>(
    {} as SelectedNovel,
  );
  const [migrateNovelDialog, setMigrateNovelDialog] = useState(false);
  const showMigrateNovelDialog = () => setMigrateNovelDialog(true);
  const hideMigrateNovelDialog = () => setMigrateNovelDialog(false);

  const inLibrary = (url: string) => library.some(obj => obj.url === url);

  const renderItem: FlatListProps<NovelItem>['renderItem'] = ({ item }) => (
    <GlobalSearchNovelCover
      novel={item}
      theme={theme}
      onPress={() => showModal(item.url, item.name)}
      onLongPress={() =>
        navigation.push('Novel', { pluginId: pluginId, ...item })
      }
      inLibrary={inLibrary(item.url)}
    />
  );

  const showModal = (url: string, name: string) => {
    if (inLibrary(url)) {
      showToast(getString('browseScreen.migration.novelAlreadyInLibrary'));
    } else {
      setSelectedNovel({ url, name });
      showMigrateNovelDialog();
    }
  };

  return (
    <>
      <FlatList
        contentContainerStyle={styles.flatListCont}
        horizontal={true}
        data={data.novels}
        keyExtractor={(item, index) => index + item.url}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.onSurfaceVariant,
              padding: 8,
              paddingVertical: 4,
            }}
          >
            {getString('sourceScreen.noResultsFound')}
          </Text>
        }
      />
      <Portal>
        <Modal
          visible={migrateNovelDialog}
          onDismiss={hideMigrateNovelDialog}
          contentContainerStyle={{
            padding: 24,
            margin: 20,
            borderRadius: 28,
            backgroundColor: theme.overlay3,
          }}
        >
          <Text
            style={{
              color: theme.onSurface,
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            {getString('browseScreen.migration.dialogMessage', {
              url: selectedNovel.url,
            })}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              onPress={hideMigrateNovelDialog}
              title={getString('common.cancel')}
            />
            <Button
              onPress={() => {
                hideMigrateNovelDialog();
                migrateNovel(pluginId, fromNovel, selectedNovel.url);
              }}
              title={getString('novelScreen.migrate')}
            />
          </View>
        </Modal>
      </Portal>
    </>
  );
};

export default MigrationNovelList;

const styles = StyleSheet.create({
  flatListCont: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
