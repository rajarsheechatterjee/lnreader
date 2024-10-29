import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Modal, overlay, TextInput } from 'react-native-paper';
import { StorageAccessFramework } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import { Button } from '@components/index';

import { showToast } from '@utils/showToast';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { useKeyboardHeight } from '@hooks/common/useKeyboardHeight';
import { WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { top } = useSafeAreaInsets();

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
  const marginHorizontal = useSharedValue(30);
  const marginBottom = useSharedValue(WINDOW_HEIGHT * 0.2 - 24);
  const height = useSharedValue(WINDOW_HEIGHT * 0.6);
  const borderRadius = useSharedValue(14);
  const padding = useSharedValue(24);

  const maxHeight = useSharedValue(100);

  const buttonMargin = useSharedValue(16);

  useEffect(() => {
    if (keyboardHeight) {
      marginHorizontal.value = 0;
      borderRadius.value = 0;
      marginBottom.value = keyboardHeight - 4;
      height.value = WINDOW_HEIGHT - keyboardHeight - top;
      maxHeight.value = 0;
      buttonMargin.value = 0;
      padding.value = 12;
    } else {
      marginHorizontal.value = 30;
      borderRadius.value = 14;
      marginBottom.value = WINDOW_HEIGHT * 0.2 - 24;
      height.value = WINDOW_HEIGHT * 0.6;
      maxHeight.value = 100;
      buttonMargin.value = 16;
      padding.value = 24;
    }
  }, [keyboardHeight]);

  const duration = 150;
  const animatedStyles = useAnimatedStyle(() => ({
    marginHorizontal: withTiming(marginHorizontal.value, { duration }),
    marginBottom: withTiming(marginBottom.value, { duration: 75 }),
    height: withTiming(height.value, { duration }),
    borderRadius: withTiming(borderRadius.value, { duration }),
    padding: withTiming(padding.value, { duration }),
  }));
  const hideView = useAnimatedStyle(() => ({
    maxHeight: withTiming(maxHeight.value, { duration }),
  }));
  const hideMargin = useAnimatedStyle(() => ({
    marginTop: withTiming(buttonMargin.value, { duration }),
  }));

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.contentContainer}
    >
      <Pressable style={{ flex: 1, width: '100%' }} onPress={onDismiss}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: overlay(2, theme.surface),
            },
            animatedStyles,
          ]}
        >
          <Animated.View style={hideView}>
            <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
              {title}
            </Text>
            <Text
              style={[
                {
                  color: theme.onSurfaceVariant,
                  minHeight: 50,
                  textAlignVertical: 'center',
                },
              ]}
            >
              {description}
            </Text>
          </Animated.View>
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
          <Animated.View style={[styles.customCSSButtons, hideMargin]}>
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
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default CustomFileModal;

const styles = StyleSheet.create({
  contentContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  modalContainer: {
    padding: 24,
    borderRadius: 28,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
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
    flex: 1,
    marginHorizontal: 8,
  },
});
