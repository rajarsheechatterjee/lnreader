import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import Slider from '@react-native-community/slider';
import { getString } from '@strings/translations';

const TRACK_TINT_COLOR = '#000000';

const TextSizeSlider: React.FC = () => {
  const theme = useTheme();

  const { textSize, setChapterReaderSettings } = useChapterReaderSettings();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
        {getString('readerScreen.bottomSheet.textSize')}
      </Text>
      <Slider
        style={styles.slider}
        value={textSize}
        minimumValue={0.2}
        maximumValue={3}
        step={0.1}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={TRACK_TINT_COLOR}
        thumbTintColor={theme.primary}
        onSlidingComplete={value =>
          setChapterReaderSettings({ textSize: value })
        }
      />
    </View>
  );
};

export default TextSizeSlider;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
