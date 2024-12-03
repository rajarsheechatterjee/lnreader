import React from 'react';
import { Pressable, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { ThemeColors } from '../../theme/types';
import Color from 'color';
import { MaterialDesignIconName } from '@type/icon';

interface ToggleButtonProps {
  icon: MaterialDesignIconName;
  selected: boolean;
  theme: ThemeColors;
  color?: string;
  onPress: () => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  icon,
  selected,
  theme,
  color,
  onPress,
}) => (
  <View
    style={{
      borderRadius: 6,
      overflow: 'hidden',
      marginHorizontal: 6,
    }}
  >
    <Pressable
      android_ripple={{ color: theme.rippleColor }}
      style={{
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected
          ? Color(theme.primary).alpha(0.12).string()
          : 'transparent',
      }}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        color={selected ? theme.primary : color ? color : theme.onSurface}
        size={24}
      />
    </Pressable>
  </View>
);

interface ToggleColorButtonProps {
  selected: boolean;
  backgroundColor: string;
  textColor: string;
  onPress: () => void;
}

export const ToggleColorButton: React.FC<ToggleColorButtonProps> = ({
  selected,
  backgroundColor,
  textColor,
  onPress,
}) => (
  <View
    style={{
      borderRadius: 50,
      overflow: 'hidden',
      marginHorizontal: 6,
      height: 44,
      width: 44,
    }}
  >
    <Pressable
      android_ripple={{ color: textColor }}
      style={{
        flex: 1,
        padding: 10,
        backgroundColor: backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={selected ? 'check' : 'format-color-text'}
        color={textColor}
        size={24}
      />
    </Pressable>
  </View>
);
