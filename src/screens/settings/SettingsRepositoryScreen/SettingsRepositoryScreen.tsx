import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { FAB, Portal } from 'react-native-paper';

import { Appbar, EmptyView } from '@components';

import {
  createRepository,
  getRepositoriesFromDb,
  isRepoUrlDuplicate,
  updateRepository,
} from '@database/queries/RepositoryQueries';
import { Repository } from '@database/types';
import { useBackHandler, useBoolean } from '@hooks/index';
import { usePlugins, useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

import AddRepositoryModal from './components/AddRepositoryModal';
import CategorySkeletonLoading from '@screens/Categories/components/CategorySkeletonLoading';
import RepositoryCard from './components/RepositoryCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RespositorySettingsScreenProps,
  RootStackParamList,
} from '@navigators/types';
import { showToast } from '@utils/showToast';

const SettingsBrowseScreen = ({
  route: { params },
  navigation,
}: RespositorySettingsScreenProps) => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { refreshPlugins } = usePlugins();

  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState<Repository[]>();
  const getRepositories = async () => {
    try {
      let res = await getRepositoriesFromDb();
      setRepositories(res);
    } finally {
      setIsLoading(false);
    }
  };

  const upsertRepository = async (
    repositoryUrl: string,
    repository?: Repository,
  ) => {
    if (!new RegExp(/https?:\/\/(.*)plugins\.min\.json/).test(repositoryUrl)) {
      showToast('Repository URL is invalid');
      return;
    }

    if (await isRepoUrlDuplicate(repositoryUrl)) {
      showToast('A respository with this url already exists!');
    } else {
      if (repository) {
        await updateRepository(repository.id, repositoryUrl);
      } else {
        await createRepository(repositoryUrl);
      }
      closeAddRepositoryModal();
      getRepositories();
      refreshPlugins();
    }
  };

  useEffect(() => {
    getRepositories();
  }, []);

  useEffect(() => {
    if (params?.url) {
      upsertRepository(params.url);
    }
  }, [params]);

  const {
    value: addRepositoryModalVisible,
    setTrue: showAddRepositoryModal,
    setFalse: closeAddRepositoryModal,
  } = useBoolean();

  useBackHandler(() => {
    if (!navigation.canGoBack()) {
      navigation.popTo<keyof RootStackParamList>('BottomNavigator');
      return true;
    }
    return false;
  });

  return (
    <>
      <Appbar
        title={'Repositories'}
        handleGoBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
          navigation.popTo<keyof RootStackParamList>('BottomNavigator');
        }}
        theme={theme}
      />
      {isLoading ? (
        <CategorySkeletonLoading width={360.7} height={89.5} theme={theme} />
      ) : (
        <FlatList
          data={repositories}
          contentContainerStyle={styles.contentCtn}
          renderItem={({ item }) => (
            <RepositoryCard
              repository={item}
              refetchRepositories={getRepositories}
              upsertRepository={upsertRepository}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              icon="Σ(ಠ_ಠ)"
              description={getString('repositories.emptyMsg')}
              theme={theme}
            />
          }
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: theme.primary, bottom: bottom }]}
        color={theme.onPrimary}
        label={getString('common.add')}
        uppercase={false}
        onPress={showAddRepositoryModal}
        icon={'plus'}
      />
      <Portal>
        <AddRepositoryModal
          visible={addRepositoryModalVisible}
          closeModal={closeAddRepositoryModal}
          upsertRepository={upsertRepository}
        />
      </Portal>
    </>
  );
};

export default SettingsBrowseScreen;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
  },
  contentCtn: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 100,
  },
});
