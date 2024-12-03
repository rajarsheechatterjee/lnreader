import { useTheme } from '@hooks/persisted';
import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { MaterialDesignIconName } from '@type/icon';

type Action = {
  icon: MaterialDesignIconName;
  onPress: () => void;
};

interface ActionbarProps {
  active: boolean;
  actions: Action[];
  viewStyle?: StyleProp<ViewProps>;
}

export const Actionbar: React.FC<ActionbarProps> = ({
  active,
  actions,
  viewStyle,
}) => {
  const theme = useTheme();

  const { bottom } = useSafeAreaInsets();

  if (active) {
    return (
      <View
        style={[
          styles.actionbarContainer,
          {
            backgroundColor: theme.surface2,
            minHeight: 80 + bottom,
            paddingBottom: bottom,
          },
          viewStyle,
        ]}
      >
        {actions.map(({ icon, onPress }, id) => (
          <Pressable
            key={id}
            android_ripple={{
              radius: 50,
              color: theme.rippleColor,
              borderless: true,
            }}
            onPress={onPress}
          >
            <MaterialCommunityIcons
              name={icon}
              color={theme.onSurface}
              size={24}
            />
          </Pressable>
        ))}
      </View>
    );
  } else {
    return null;
  }
};

const styles = StyleSheet.create({
  actionbarContainer: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
