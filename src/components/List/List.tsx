import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { List as PaperList, Divider as PaperDivider } from 'react-native-paper';
import { ThemeColors } from '../../theme/types';

interface ListItemProps {
  title: string;
  description?: string | null;
  icon?: string;
  onPress?: () => void;
  theme: ThemeColors;
  disabled?: boolean;
  right?: string;
}

const Section = ({
  children,
  style,
}: {
  style?: ViewStyle;
  children: ReactNode;
}) => (
  <PaperList.Section style={[styles.listSection, style]}>
    {children}
  </PaperList.Section>
);

const SubHeader = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: ThemeColors;
}) => (
  <PaperList.Subheader style={{ color: theme.primary }}>
    {children}
  </PaperList.Subheader>
);

const Item: React.FC<ListItemProps> = ({
  title,
  description,
  icon,
  onPress,
  theme,
  disabled,
  right,
}) => (
  <PaperList.Item
    title={title}
    titleStyle={{ color: disabled ? theme.onSurfaceDisabled : theme.onSurface }}
    description={description}
    descriptionStyle={[
      styles.description,
      {
        color: disabled ? theme.onSurfaceDisabled : theme.onSurfaceVariant,
      },
    ]}
    left={
      icon
        ? () => (
            <PaperList.Icon
              color={theme.primary}
              icon={icon}
              style={styles.iconCtn}
            />
          )
        : undefined
    }
    right={
      right
        ? () => (
            <PaperList.Icon
              color={theme.primary}
              icon={right}
              style={styles.iconCtn}
            />
          )
        : undefined
    }
    disabled={disabled}
    onPress={onPress}
    rippleColor={theme.rippleColor}
    style={styles.listItemCtn}
  />
);

const Divider = ({ theme }: { theme: ThemeColors }) => (
  <PaperDivider style={[styles.divider, { backgroundColor: theme.outline }]} />
);

const InfoItem = ({
  title,
  icon = 'information-outline',
  theme,
}: {
  title: string;
  icon?: string;
  theme: ThemeColors;
}) => (
  <View style={styles.infoCtn}>
    <MaterialIcon size={20} color={theme.onSurfaceVariant} name={icon} />
    <Text style={[styles.infoMsg, { color: theme.onSurfaceVariant }]}>
      {title}
    </Text>
  </View>
);

const Icon = ({ icon, theme }: { icon: string; theme: ThemeColors }) => (
  <PaperList.Icon color={theme.primary} icon={icon} style={{ margin: 0 }} />
);

interface ColorItemProps {
  title: string;
  description: string;
  theme: ThemeColors;
  onPress: () => void;
}

const ColorItem = ({ title, description, theme, onPress }: ColorItemProps) => (
  <Pressable
    style={{
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
    android_ripple={{ color: theme.rippleColor }}
    onPress={onPress}
  >
    <View>
      <Text style={{ color: theme.onSurface, fontSize: 16 }}>{title}</Text>
      <Text style={{ color: theme.onSurfaceVariant }}>{description}</Text>
    </View>
    <View
      style={{
        backgroundColor: description,
        height: 24,
        width: 24,
        borderRadius: 50,
        marginRight: 16,
      }}
    />
  </Pressable>
);

export default {
  Section,
  SubHeader,
  Item,
  Divider,
  InfoItem,
  Icon,
  ColorItem,
};

const styles = StyleSheet.create({
  listSection: {
    flex: 1,
    marginVertical: 0,
  },
  divider: {
    height: 1,
    opacity: 0.5,
  },
  infoCtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoMsg: {
    marginTop: 12,
    fontSize: 12,
  },
  iconCtn: {
    paddingLeft: 16,
  },
  listItemCtn: {
    paddingVertical: 12,
  },
  description: {
    fontSize: 12,
    lineHeight: 20,
  },
});
