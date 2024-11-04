import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  Portal,
  Modal,
  overlay,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { RadioButton } from '@components/RadioButton/RadioButton';

import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import { Voice } from 'expo-speech';
import { FlashList } from '@shopify/flash-list';

interface VoicePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  voices: Voice[];
}

const VoicePickerModal: React.FC<VoicePickerModalProps> = ({
  onDismiss,
  visible,
  voices,
}) => {
  const theme = useTheme();
  const [searchedVoices, setSearchedVoices] = useState<Voice[]>([]);
  const [searchText, setSearchText] = useState('');
  const { setChapterReaderSettings, tts } = useChapterReaderSettings();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <FlashList
          ListHeaderComponent={
            <TextInput
              mode="outlined"
              underlineColor={theme.outline}
              theme={{ colors: { ...theme } }}
              onChangeText={text => {
                setSearchText(text);
                setSearchedVoices(
                  voices.filter(voice =>
                    voice.name
                      .toLocaleLowerCase()
                      .includes(text.toLocaleLowerCase()),
                  ),
                );
              }}
              value={searchText}
              placeholder="Search voice"
            />
          }
          ListHeaderComponentStyle={{ paddingHorizontal: 12 }}
          data={searchText ? searchedVoices : voices}
          extraData={tts?.voice}
          renderItem={({ item }) => (
            <RadioButton
              key={item.identifier}
              status={item.identifier === tts?.voice?.identifier}
              onPress={() =>
                setChapterReaderSettings({ tts: { ...tts, voice: item } })
              }
              label={item.name + ` (${item.language})`}
              labelStyle={{ fontFamily: item.name }}
              theme={theme}
            />
          )}
          keyExtractor={item => item.identifier || 'system'}
          estimatedItemSize={64}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <ActivityIndicator
              size={24}
              style={{ marginTop: 16 }}
              color={theme.primary}
            />
          }
        />
      </Modal>
    </Portal>
  );
};

export default VoicePickerModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 24,
    margin: 20,
    borderRadius: 28,
    flex: 1,
  },
});
