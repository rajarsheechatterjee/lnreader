import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';

import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import { IconButtonV2 } from '@components';
import { ChapterReaderSettings } from '@hooks/persisted/useSettings';

type ValueKey<T extends object> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

interface ReaderValueChangeProps {
  labelStyle?: TextStyle | TextStyle[];
  valueChange?: number;
  label: string;
  valueKey: ValueKey<ChapterReaderSettings>;
  decimals?: number;
  min?: number;
  max?: number;
  unit?: '%' | 'px' | 'rem';
}

const ReaderValueChange: React.FC<ReaderValueChangeProps> = ({
  labelStyle,
  label,
  valueChange = 0.1,
  valueKey,
  decimals = 1,
  min = 1.3,
  max = 2,
  unit = '%',
}) => {
  const theme = useTheme();
  const { setChapterReaderSettings, ...settings } = useChapterReaderSettings();
  if (!valueKey) {
    throw new Error('ValueKey has to be defined');
  }
  return (
    <View style={styles.container}>
      <Text style={[{ color: theme.onSurfaceVariant }, labelStyle]}>
        {label}
      </Text>
      <View style={styles.buttonContainer}>
        <IconButtonV2
          name="minus"
          color={theme.primary}
          size={26}
          disabled={settings[valueKey] <= min}
          onPress={() =>
            setChapterReaderSettings({
              [valueKey]: Math.max(min, settings[valueKey] - valueChange),
            })
          }
          theme={theme}
        />
        <Text style={[styles.value, { color: theme.onSurface }]}>
          {`${settings[valueKey].toFixed(decimals)}${unit}`}
        </Text>
        <IconButtonV2
          name="plus"
          color={theme.primary}
          size={26}
          disabled={settings[valueKey] >= max}
          onPress={() =>
            setChapterReaderSettings({
              [valueKey]: Math.min(max, settings[valueKey] + valueChange),
            })
          }
          theme={theme}
        />
      </View>
    </View>
  );
};

export default ReaderValueChange;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  value: {
    width: 60,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
