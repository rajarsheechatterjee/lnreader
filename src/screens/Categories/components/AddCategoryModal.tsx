import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, overlay, Portal, TextInput } from 'react-native-paper';

import { Button } from '@components/index';

import { Category } from '../../../database/types';
import {
  createCategory,
  isCategoryNameDuplicate,
  updateCategory,
} from '../../../database/queries/CategoryQueries';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';

interface AddCategoryModalProps {
  isEditMode?: boolean;
  category?: Category;
  visible: boolean;
  closeModal: () => void;
  onSuccess: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isEditMode,
  category,
  closeModal,
  visible,
  onSuccess,
}) => {
  const theme = useTheme();
  const [categoryName, setCategoryName] = useState(category?.name || '');

  function close() {
    setCategoryName('');
    closeModal();
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={close}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {getString(
            isEditMode
              ? 'categories.editCategories'
              : 'categories.addCategories',
          )}
        </Text>
        <TextInput
          autoFocus
          defaultValue={categoryName}
          placeholder={getString('common.name')}
          onChangeText={setCategoryName}
          mode="outlined"
          underlineColor={theme.outline}
          theme={{ colors: { ...theme } }}
        />
        <View style={styles.btnContainer}>
          <Button
            title={getString(isEditMode ? 'common.ok' : 'common.add')}
            onPress={async () => {
              if (isCategoryNameDuplicate(categoryName)) {
                showToast(getString('categories.duplicateError'));
              } else {
                if (isEditMode && category) {
                  updateCategory(category?.id, categoryName);
                } else {
                  createCategory(categoryName);
                }
                onSuccess();
                close();
              }
            }}
          />
          <Button title={getString('common.cancel')} onPress={close} />
        </View>
      </Modal>
    </Portal>
  );
};

export default AddCategoryModal;

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
