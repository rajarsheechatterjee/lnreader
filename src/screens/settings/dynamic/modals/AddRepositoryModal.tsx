import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, overlay, Portal, TextInput } from 'react-native-paper';

import { Button } from '@components/index';

import { Repository } from '@database/types';
import {
  createRepository,
  isRepoUrlDuplicate,
  updateRepository,
} from '@database/queries/RepositoryQueries';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';

interface AddRepositoryModalProps {
  isEditMode?: boolean;
  repository?: Repository;
  visible: boolean;
  closeModal: () => void;
  onSuccess: () => Promise<void>;
}

const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  isEditMode,
  repository,
  closeModal,
  visible,
  onSuccess,
}) => {
  const theme = useTheme();
  const [repositoryUrl, setRepositoryUrl] = useState(repository?.url || '');

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {isEditMode ? 'Edit repository' : 'Add repository'}
        </Text>
        <TextInput
          autoFocus
          defaultValue={repositoryUrl}
          placeholder={'Repo URL'}
          onChangeText={setRepositoryUrl}
          mode="outlined"
          underlineColor={theme.outline}
          theme={{ colors: { ...theme } }}
        />
        <View style={styles.btnContainer}>
          <Button
            title={getString(isEditMode ? 'common.ok' : 'common.add')}
            onPress={async () => {
              if (
                !new RegExp(/https?:\/\/(.*)plugins\.min\.json/).test(
                  repositoryUrl,
                )
              ) {
                showToast('Repository URL is invalid');
                return;
              }

              if (await isRepoUrlDuplicate(repositoryUrl)) {
                showToast('A respository with this url already exists!');
              } else {
                if (isEditMode && repository) {
                  updateRepository(repository?.id, repositoryUrl);
                } else {
                  createRepository(repositoryUrl);
                }
                onSuccess();
              }
              setRepositoryUrl('');
              closeModal();
            }}
          />
          <Button title={getString('common.cancel')} onPress={closeModal} />
        </View>
      </Modal>
    </Portal>
  );
};

export default AddRepositoryModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 32,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  btnContainer: {
    marginTop: 24,
    flexDirection: 'row-reverse',
  },
});
