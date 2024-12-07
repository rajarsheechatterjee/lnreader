import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import { Button } from '@components/index';

import { Repository } from '@database/types';
import { deleteRepositoryById } from '@database/queries/RepositoryQueries';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';

interface DeleteRepositoryModalProps {
  repository: Repository;
  visible: boolean;
  closeModal: () => void;
  onSuccess: () => void;
}

const DeleteRepositoryModal: React.FC<DeleteRepositoryModalProps> = ({
  repository,
  closeModal,
  visible,
  onSuccess,
}) => {
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.overlay3 },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {'Delete repository'}
        </Text>
        <Text style={[styles.modalDesc, { color: theme.onSurfaceVariant }]}>
          {`Do you wish to delete repository "${repository.url}"?`}
        </Text>
        <View style={styles.btnContainer}>
          <Button
            title={getString('common.ok')}
            onPress={() => {
              deleteRepositoryById(repository.id);
              closeModal();
              onSuccess();
            }}
          />
          <Button title={getString('common.cancel')} onPress={closeModal} />
        </View>
      </Modal>
    </Portal>
  );
};

export default DeleteRepositoryModal;

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
  modalDesc: {},
});
