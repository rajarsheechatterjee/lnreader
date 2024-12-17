import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';

import { NovelInfo } from '@database/types';
import { useNavigation } from '@react-navigation/native';
import { useBoolean } from '@hooks';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import SetCategoryModal from '../SetCategoriesModal';
import { NovelScreenProps } from '@navigators/types';
import { useTrackedNovel, useTracker } from '@hooks/persisted';

interface NovelScreenButtonGroupProps {
  novel: NovelInfo | (Omit<NovelInfo, 'id'> & { id: 'NO_ID' });
  theme: ThemeColors;
  handleTrackerSheet: () => void;
  handleFollowNovel: () => void;
}

const NovelScreenButtonGroup: React.FC<NovelScreenButtonGroupProps> = ({
  novel,
  handleTrackerSheet,
  handleFollowNovel,
  theme,
}) => {
  const { inLibrary, isLocal } = novel;
  const { navigate } = useNavigation<NovelScreenProps['navigation']>();
  const followButtonColor = inLibrary ? theme.primary : theme.outline;
  const { tracker } = useTracker();
  const { trackedNovel } = useTrackedNovel(novel.id);

  const trackerButtonColor = trackedNovel ? theme.primary : theme.outline;

  const handleOpenWebView = async () => {
    navigate('WebviewScreen', {
      name: novel.name,
      url: novel.path,
      pluginId: novel.pluginId,
      isNovel: true,
    });
  };
  const handleMigrateNovel = () =>
    novel.id !== 'NO_ID' &&
    navigate('MigrateNovel', {
      novel: novel,
    });

  const {
    value: setCategoryModalVisible,
    setTrue: showSetCategoryModal,
    setFalse: closeSetCategoryModal,
  } = useBoolean();

  return (
    <>
      <View style={styles.buttonGroupContainer}>
        <View style={styles.buttonContainer}>
          <Pressable
            android_ripple={{ color: theme.rippleColor }}
            onPress={handleFollowNovel}
            onLongPress={showSetCategoryModal}
            style={styles.button}
          >
            <MaterialCommunityIcons
              name={inLibrary ? 'heart' : 'heart-outline'}
              color={followButtonColor}
              size={24}
            />
            <Text style={[styles.buttonLabel, { color: followButtonColor }]}>
              {getString(
                inLibrary
                  ? 'novelScreen.inLibaray'
                  : 'novelScreen.addToLibaray',
              )}
            </Text>
          </Pressable>
        </View>
        {tracker ? (
          <View style={styles.buttonContainer}>
            <Pressable
              android_ripple={{ color: theme.rippleColor }}
              onPress={handleTrackerSheet}
              style={styles.button}
            >
              <MaterialCommunityIcons
                name={trackedNovel ? 'check' : 'sync'}
                color={trackerButtonColor}
                size={24}
              />
              <Text style={[styles.buttonLabel, { color: trackerButtonColor }]}>
                {trackedNovel
                  ? getString('novelScreen.tracked')
                  : getString('novelScreen.tracking')}
              </Text>
            </Pressable>
          </View>
        ) : null}
        {inLibrary && !isLocal ? (
          <View style={styles.buttonContainer}>
            <Pressable
              android_ripple={{ color: theme.rippleColor }}
              onPress={handleMigrateNovel}
              style={styles.button}
            >
              <MaterialCommunityIcons
                name="swap-vertical-variant"
                color={theme.outline}
                size={24}
              />
              <Text style={[styles.buttonLabel, { color: theme.outline }]}>
                {getString('novelScreen.migrate')}
              </Text>
            </Pressable>
          </View>
        ) : null}
        {!isLocal ? (
          <View style={styles.buttonContainer}>
            <Pressable
              android_ripple={{ color: theme.rippleColor }}
              onPress={handleOpenWebView}
              style={styles.button}
            >
              <MaterialCommunityIcons
                name="earth"
                color={theme.outline}
                size={24}
              />
              <Text style={[styles.buttonLabel, { color: theme.outline }]}>
                WebView
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      {novel.id !== 'NO_ID' && (
        <SetCategoryModal
          novelIds={[novel.id]}
          closeModal={closeSetCategoryModal}
          visible={setCategoryModalVisible}
        />
      )}
    </>
  );
};

export default NovelScreenButtonGroup;

const styles = StyleSheet.create({
  buttonGroupContainer: {
    marginHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 50,
    marginHorizontal: 4,
  },
  button: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    marginTop: 4,
    fontSize: 12,
  },
});
