import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Switch from './Switch';
import { ThemeColors } from '../../theme/types';

interface SwitchItemProps {
  value: boolean;
  label: string;
  description?: string;
  onPress: () => void;
  theme: ThemeColors;
  size?: number;
  style?: StyleProp<ViewStyle>;
  endOfLine?: () => React.ReactNode;
}

const SwitchItem: React.FC<SwitchItemProps> = ({
  label,
  description,
  onPress,
  theme,
  value,
  size,
  style,
  endOfLine,
}) => (
  <Pressable
    android_ripple={{ color: theme.rippleColor }}
    onPress={onPress}
    style={[styles.container, style]}
  >
    <View style={styles.labelContainer}>
      <Text style={[{ color: theme.onSurface }, styles.label]}>{label}</Text>
      {description ? (
        <Text style={[styles.description, { color: theme.onSurfaceVariant }]}>
          {description}
        </Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onPress}
      theme={theme}
      style={styles.switch}
      size={size}
    />
    {endOfLine ? endOfLine() : null}
  </Pressable>
);

export default SwitchItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  label: {
    fontSize: 16,
  },
  description: {
    fontSize: 12,
  },
  switch: {
    alignSelf: 'center',
  },
});
