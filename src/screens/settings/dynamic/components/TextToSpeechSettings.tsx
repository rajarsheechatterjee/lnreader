import { IconButtonV2, List } from '@components';
import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useTheme,
} from '@hooks/persisted';
import React, { useEffect, useState } from 'react';
import VoicePickerModal from '../modals/VoicePickerModal';
import { useBoolean } from '@hooks';
import { Portal } from 'react-native-paper';
import { StyleSheet, View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { getAvailableVoicesAsync, Voice } from 'expo-speech';
import Switch from '@components/Switch/Switch';
import SettingSwitchV2 from './SettingSwitchV2';

export default function TextToSpeechSettings() {
  const theme = useTheme();
  const [voices, setVoices] = useState<Voice[]>([]);
  useEffect(() => {
    getAvailableVoicesAsync().then(res => {
      res.sort((a, b) => a.name.localeCompare(b.name));
      setVoices([{ name: 'System', language: 'System' } as Voice, ...res]);
    });
  }, []);

  const { tts, setChapterReaderSettings } = useChapterReaderSettings();
  const { TTSEnable = true, setChapterGeneralSettings } =
    useChapterGeneralSettings();
  const {
    value: voiceModalVisible,
    setTrue: showVoiceModal,
    setFalse: hideVoiceModal,
  } = useBoolean();
  console.log(TTSEnable);

  return (
    <>
      <View style={styles.row}>
        <SettingSwitchV2
          setting={{
            settingOrigin: 'GeneralChapter',
            valueKey: 'TTSEnable',
            defaultValue: true,
            title: 'Text to Speech',
            type: 'Switch',
          }}
          theme={theme}
          endOfLine={() => (
            <IconButtonV2
              name="reload"
              theme={theme}
              color={theme.primary}
              style={{ marginLeft: 6 }}
              onPress={() => {
                setChapterReaderSettings({
                  tts: {
                    pitch: 1,
                    rate: 1,
                    voice: { name: 'System', language: 'System' } as Voice,
                  },
                });
              }}
            />
          )}
        />
      </View>
      {TTSEnable ? (
        <>
          <List.Item
            title={'TTS voice'}
            description={tts?.voice?.name || 'System'}
            onPress={showVoiceModal}
            theme={theme}
          />
          <List.Section>
            <Text style={[styles.label, { color: theme.onSurface }]}>
              Voice rate
            </Text>
            <Slider
              style={styles.slider}
              value={tts?.rate}
              minimumValue={0.1}
              maximumValue={5}
              step={0.1}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.surfaceVariant}
              thumbTintColor={theme.primary}
              onSlidingComplete={value =>
                setChapterReaderSettings({ tts: { ...tts, rate: value } })
              }
            />
            <Text style={[styles.label, { color: theme.onSurface }]}>
              Voice pitch
            </Text>
            <Slider
              style={styles.slider}
              value={tts?.pitch}
              minimumValue={0.1}
              maximumValue={5}
              step={0.1}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.surfaceVariant}
              thumbTintColor={theme.primary}
              onSlidingComplete={value =>
                setChapterReaderSettings({ tts: { ...tts, pitch: value } })
              }
            />
          </List.Section>
        </>
      ) : null}
      <View style={{ height: 16 }} />
      <Portal>
        <VoicePickerModal
          visible={voiceModalVisible}
          onDismiss={hideVoiceModal}
          voices={voices}
        />
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
