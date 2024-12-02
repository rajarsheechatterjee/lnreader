import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, overlay, Portal, TextInput } from 'react-native-paper';

import { Button } from '@components/index';

import { Repository } from '@database/types';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';

interface AddRepositoryModalProps {
  repository?: Repository;
  visible: boolean;
  closeModal: () => void;
  upsertRepository: (
    repositoryUrl: string,
    repository?: Repository,
  ) => Promise<void>;
}

const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  repository,
  closeModal,
  visible,
  upsertRepository,
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
          {repository ? 'Edit repository' : 'Add repository'}
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
            title={getString(repository ? 'common.ok' : 'common.add')}
            onPress={() => upsertRepository(repositoryUrl, repository)}
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
