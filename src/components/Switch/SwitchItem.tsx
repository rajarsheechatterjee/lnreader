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
    style={[styles.container, style]}
    onPress={onPress}
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
  },
  description: {
    fontSize: 12,
    lineHeight: 20,
  },
  switch: {
    marginLeft: 8,
  },
});
