import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Portal } from 'react-native-paper';

import { EmptyView } from '@components';

import { getRepositoriesFromDb } from '@database/queries/RepositoryQueries';
import { Repository } from '@database/types';
import { useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

import AddRepositoryModal from '../modals/AddRepositoryModal';
import CategorySkeletonLoading from '@screens/Categories/components/CategorySkeletonLoading';
import RepositoryCard from './RepositoryCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RepoSettings = () => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState<Repository[]>();
  const getRepositories = async () => {
    try {
      let res = await getRepositoriesFromDb();
      setRepositories(res);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRepositories();
  }, []);

  const {
    value: addRepositoryModalVisible,
    setTrue: showAddRepositoryModal,
    setFalse: closeAddRepositoryModal,
  } = useBoolean();

  return (
    <View style={[styles.full]}>
      <FAB
        style={[styles.fab, { backgroundColor: theme.primary, bottom: bottom }]}
        color={theme.onPrimary}
        label={getString('common.add')}
        uppercase={false}
        onPress={showAddRepositoryModal}
        icon={'plus'}
      />
      {isLoading ? (
        <CategorySkeletonLoading width={360.7} height={89.5} theme={theme} />
      ) : !repositories || repositories.length === 0 ? (
        <EmptyView
          icon="Σ(ಠ_ಠ)"
          description={getString('repositories.emptyMsg')}
          theme={theme}
        />
      ) : (
        repositories.map(item => {
          return (
            <RepositoryCard
              key={item.id}
              repository={item}
              refetchRepositories={getRepositories}
            />
          );
        })
      )}

      <Portal>
        <AddRepositoryModal
          visible={addRepositoryModalVisible}
          closeModal={closeAddRepositoryModal}
          onSuccess={getRepositories}
        />
      </Portal>
    </View>
  );
};

export default RepoSettings;

const styles = StyleSheet.create({
  fab: {
    // position: 'absolute',
    marginHorizontal: 16,
    right: 0,
  },
  contentCtn: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  full: {
    flexGrow: 1,
  },
});
