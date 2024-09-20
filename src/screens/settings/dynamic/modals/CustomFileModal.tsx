import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, overlay, TextInput } from 'react-native-paper';
import { StorageAccessFramework } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import { Button } from '@components/index';

import { showToast } from '@utils/showToast';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { useKeyboardHeight } from '@hooks/common/useKeyboardHeight';

interface CustomFileModal {
  visible: boolean;
  onDismiss: () => void;
  defaultValue: string;
  onSave: (val: string) => void;
  title: string;
  mimeType: 'text/css' | 'application/javascript';
  openFileLabel: string;
  placeholder?: string;
  description?: string;
}

const CustomFileModal: React.FC<CustomFileModal> = ({
  onDismiss,
  visible,
  defaultValue,
  onSave,
  title,
  mimeType,
  openFileLabel,
  placeholder,
  description,
}) => {
  const theme = useTheme();
  const [text, setText] = useState('');
  const keyboardHeight = useKeyboardHeight();

  const openDocumentPicker = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
        type: mimeType,
      });

      if (file.assets) {
        const content = await StorageAccessFramework.readAsStringAsync(
          file.assets[0].uri,
        );

        onSave(content.trim());
        onDismiss();
      }
    } catch (error: any) {
      showToast(error.message);
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        styles.modalContainer,
        {
          backgroundColor: overlay(2, theme.surface),
        },
        keyboardHeight
          ? {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              margin: 0,
              marginBottom: keyboardHeight - 14,
            }
          : {},
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
        {title}
      </Text>
      <Text style={[{ color: theme.onSurfaceVariant }]}>{description}</Text>
      <TextInput
        multiline
        mode="outlined"
        defaultValue={defaultValue}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={theme.onSurfaceDisabled}
        underlineColor={theme.outline}
        style={[{ color: theme.onSurface }, styles.textInput]}
        theme={{ colors: { ...theme } }}
      />
      <View style={styles.customCSSButtons}>
        <Button
          onPress={() => {
            onSave(text.trim());
            onDismiss();
          }}
          style={styles.button}
          title={getString('common.save')}
          mode="contained"
        />
        <Button
          style={styles.button}
          onPress={openDocumentPicker}
          title={openFileLabel}
        />
      </View>
    </Modal>
  );
};

export default CustomFileModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  textInput: {
    height: 220,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  customCSSButtons: {
    flexDirection: 'row-reverse',
  },
  button: {
    marginTop: 16,
    flex: 1,
    marginHorizontal: 8,
  },
});
