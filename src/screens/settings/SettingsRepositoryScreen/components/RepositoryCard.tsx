import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

import { IconButtonV2 } from '@components';

import { Repository } from '@database/types';
import { useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/persisted';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import { Portal } from 'react-native-paper';
import AddRepositoryModal from './AddRepositoryModal';
import DeleteRepositoryModal from './DeleteRepositoryModal';

interface RepositoryCardProps {
  repository: Repository;
  refetchRepositories: () => void;
  upsertRepository: (repositoryUrl: string, repository?: Repository) => void;
}

const RepositoryCard: FC<RepositoryCardProps> = ({
  repository,
  refetchRepositories,
  upsertRepository,
}) => {
  const theme = useTheme();

  const {
    value: repositoryModalVisible,
    setTrue: showRepositoryModal,
    setFalse: closeRepositoryModal,
  } = useBoolean();

  const {
    value: deleteRepositoryModalVisible,
    setTrue: showDeleteRepositoryModal,
    setFalse: closeDeleteRepositoryModal,
  } = useBoolean();

  return (
    <View
      style={[
        styles.cardCtn,
        {
          backgroundColor: theme.secondaryContainer,
        },
      ]}
    >
      <View style={styles.nameCtn}>
        <IconButtonV2
          name="label-outline"
          color={theme.onSurface}
          padding={0}
          theme={theme}
        />
        <Text
          style={[styles.name, { color: theme.onSurface }]}
          onPress={showRepositoryModal}
        >
          {`${repository.url.split('/')?.[3]}/${
            repository.url.split('/')?.[4]
          }`}
        </Text>
      </View>
      <View style={styles.buttonsCtn}>
        <IconButtonV2
          name="open-in-new"
          color={theme.onSurface}
          onPress={() => Linking.openURL(repository.url)}
          theme={theme}
        />
        <IconButtonV2
          name="content-copy"
          color={theme.onSurface}
          style={styles.manageBtn}
          onPress={() =>
            Clipboard.setStringAsync(repository.url).then(() => {
              showToast(getString('common.copiedToClipboard', { name: '' }));
            })
          }
          theme={theme}
        />
        <IconButtonV2
          name="delete-outline"
          color={theme.onSurface}
          style={styles.manageBtn}
          onPress={showDeleteRepositoryModal}
          theme={theme}
        />
      </View>
      <Portal>
        <AddRepositoryModal
          repository={repository}
          visible={repositoryModalVisible}
          closeModal={closeRepositoryModal}
          upsertRepository={upsertRepository}
        />
        <DeleteRepositoryModal
          repository={repository}
          visible={deleteRepositoryModalVisible}
          closeModal={closeDeleteRepositoryModal}
          onSuccess={refetchRepositories}
        />
      </Portal>
    </View>
  );
};

export default RepositoryCard;

const styles = StyleSheet.create({
  cardCtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  nameCtn: {
    flex: 1,
    marginLeft: 8,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  manageBtn: {
    marginLeft: 8,
  },
  buttonsCtn: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
