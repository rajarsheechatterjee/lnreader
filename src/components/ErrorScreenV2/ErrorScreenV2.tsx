import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '@hooks/persisted';
import { getErrorMessage } from '@utils/error';

interface ErrorScreenProps {
  error: any;
  actions?: Array<{
    iconName: string;
    title: string;
    onPress: () => void;
  }>;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, actions }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: theme.outline }]}>ಥ_ಥ</Text>
      <Text style={[styles.error, { color: theme.outline }]}>
        {getErrorMessage(error)}
      </Text>
      {actions?.length ? (
        <View style={styles.actionsCtn}>
          {actions.map(action => (
            <View key={action.title} style={styles.buttonWrapper}>
              <Pressable
                android_ripple={{ color: theme.rippleColor }}
                onPress={action.onPress}
                style={styles.buttonCtn}
              >
                <MaterialCommunityIcons
                  name={action.iconName}
                  size={24}
                  color={theme.outline}
                />
                <Text style={{ color: theme.outline }}>{action.title}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default ErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 44,
  },
  error: {
    marginTop: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  buttonWrapper: {
    overflow: 'hidden',
    borderRadius: 50,
    marginHorizontal: 4,
    flexDirection: 'row',
    flex: 1 / 3,
  },
  buttonCtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsCtn: {
    marginTop: 20,
    flexDirection: 'row',
  },
});
