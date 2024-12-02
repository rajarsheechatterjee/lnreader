import React from 'react';
import { View, Text, /* StyleSheet, */ Pressable } from 'react-native';
import { overlay } from 'react-native-paper';
import color from 'color';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { ThemeColors } from '@theme/types';

interface ThemePickerProps {
  theme: ThemeColors;
  currentTheme: ThemeColors;
  onPress: () => void;
}

export const ThemePicker = ({
  theme,
  currentTheme,
  onPress,
}: ThemePickerProps) => (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    }}
  >
    <View
      style={{
        backgroundColor: theme.background,
        borderWidth: 3.6,
        borderColor:
          currentTheme.id === theme.id
            ? theme.primary
            : currentTheme.background,
        width: 95,
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 1,
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onPress}>
        {currentTheme.id === theme.id ? (
          <MaterialCommunityIcons
            name="check"
            color={theme.onPrimary}
            size={15}
            style={{
              backgroundColor: theme.primary,
              position: 'absolute',
              top: 5,
              right: 5,
              elevation: 2,
              borderRadius: 50,
              padding: 1.6,
              zIndex: 1,
            }}
          />
        ) : null}
        <View
          style={{
            height: 20,
            backgroundColor: overlay(2, theme.surface),
            elevation: 1,
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: theme.onSurface,
              width: 44,
              height: 10,
              marginLeft: 8,
              borderRadius: 50,
            }}
          />
        </View>
        <View style={{ padding: 8 }}>
          <View
            style={{
              height: 18,
              backgroundColor: theme.onSurfaceVariant,
              borderRadius: 4,
            }}
          />
          <View style={{ paddingVertical: 4, flexDirection: 'row' }}>
            <View
              style={{
                height: 10,
                width: 44,
                backgroundColor: theme.onSurface,
                borderRadius: 50,
              }}
            />
            <View
              style={{
                height: 10,
                width: 16,
                marginLeft: 4,
                backgroundColor: theme.primary,
                borderRadius: 50,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                height: 10,
                width: 24,
                backgroundColor: theme.onSurfaceVariant,
                borderRadius: 50,
              }}
            />
            <View
              style={{
                height: 10,
                width: 24,
                backgroundColor: theme.onSurfaceVariant,
                borderRadius: 50,
                marginLeft: 4,
              }}
            />
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 24,
            backgroundColor: color(theme.primary).alpha(0.08).string(),
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 50,
                backgroundColor: theme.onSurface,
                opacity: 0.54,
              }}
            />
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 50,
                backgroundColor: theme.primary,
              }}
            />
            <View
              style={{
                height: 12,
                width: 12,
                borderRadius: 50,
                backgroundColor: theme.onSurface,
                opacity: 0.54,
              }}
            />
          </View>
        </View>
      </Pressable>
    </View>
    <Text
      style={{
        color: currentTheme.onSurface,
        fontSize: 12,
        paddingVertical: 4,
      }}
    >
      {theme.name}
    </Text>
  </View>
);

// const styles = StyleSheet.create({});
