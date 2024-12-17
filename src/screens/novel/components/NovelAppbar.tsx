import React, { useState } from 'react';
import { getString } from '@strings/translations';
import { Appbar, Menu as DefaultMenu } from 'react-native-paper';
import { ThemeColors } from '@theme/types';
import Animated, {
  SharedValue,
  SlideInUp,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import EpubIconButton from './EpubIconButton';
import { ChapterInfo, NovelInfo } from '@database/types';

const Menu = ({
  visible,
  onDismiss,
  anchor,
  items,
  theme,
}: {
  visible: boolean;
  onDismiss: () => void;
  anchor: React.ReactNode;
  theme: ThemeColors;
  items: { label: string; onPress: () => void }[];
}) => {
  return (
    <DefaultMenu
      visible={visible}
      onDismiss={onDismiss}
      anchor={anchor}
      anchorPosition="bottom"
      contentStyle={{ backgroundColor: theme.surface2 }}
    >
      {items.map((item, index) => (
        <DefaultMenu.Item
          key={index + item.label}
          title={item.label}
          style={{ backgroundColor: theme.surface2 }}
          titleStyle={{ color: theme.onSurface }}
          onPress={() => {
            onDismiss();
            item.onPress();
          }}
        />
      ))}
    </DefaultMenu>
  );
};

const NovelAppbar = ({
  novel,
  chapters,
  theme,
  isLocal,
  isLoading,
  downloadChapters,
  deleteChapters,
  showEditInfoModal,
  downloadCustomChapterModal,
  setCustomNovelCover,
  goBack,
  shareNovel,
  showJumpToChapterModal,
  headerOpacity,
}: {
  novel: NovelInfo | undefined;
  chapters: ChapterInfo[];
  theme: ThemeColors;
  isLocal: boolean | undefined;
  isLoading: boolean;
  downloadChapters: (amount: number | 'all' | 'unread') => void;
  deleteChapters: () => void;
  showEditInfoModal: React.Dispatch<React.SetStateAction<boolean>>;
  downloadCustomChapterModal: () => void;
  setCustomNovelCover: () => Promise<void>;
  goBack: () => void;
  shareNovel: () => void;
  showJumpToChapterModal: (arg: boolean) => void;
  headerOpacity: SharedValue<number>;
}) => {
  const headerOpacityStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      headerOpacity.value,
      [0, 1],
      ['transparent', theme.surface2 || theme.surface],
    );
    return {
      backgroundColor,
    };
  });

  const [downloadMenu, showDownloadMenu] = useState(false);
  const [extraMenu, showExtraMenu] = useState(false);

  return (
    <Animated.View style={[headerOpacityStyle]}>
      <Appbar.Header theme={{ colors: { ...theme, surface: 'transparent' } }}>
        <Appbar.BackAction onPress={goBack} />
        {!isLoading && (
          <Animated.View
            entering={SlideInUp.duration(150)}
            style={{ flexDirection: 'row', position: 'absolute', right: 0 }}
          >
            <Appbar.Content title="" />
            {novel && (
              <EpubIconButton theme={theme} novel={novel} chapters={chapters} />
            )}
            <Appbar.Action
              icon="share-variant"
              theme={{ colors: theme }}
              onPress={shareNovel}
            />
            <Appbar.Action
              theme={{ colors: theme }}
              icon="text-box-search-outline"
              onPress={() => {
                showJumpToChapterModal(true);
              }}
            />
            {!isLocal && (
              <Menu
                theme={theme}
                visible={downloadMenu}
                onDismiss={() => showDownloadMenu(false)}
                anchor={
                  <Appbar.Action
                    icon="download-outline"
                    onPress={() => showDownloadMenu(true)}
                    theme={{ colors: theme }}
                    style={{ paddingTop: 2 }}
                    size={27}
                  />
                }
                items={[
                  {
                    label: getString('novelScreen.download.next'),
                    onPress: () => downloadChapters(1),
                  },
                  {
                    label: getString('novelScreen.download.next5'),
                    onPress: () => downloadChapters(5),
                  },
                  {
                    label: getString('novelScreen.download.next10'),
                    onPress: () => downloadChapters(10),
                  },
                  {
                    label: getString('novelScreen.download.custom'),
                    onPress: () => downloadCustomChapterModal(),
                  },
                  {
                    label: getString('novelScreen.download.unread'),
                    onPress: () => downloadChapters('unread'),
                  },
                  {
                    label: getString('common.all'),
                    onPress: () => downloadChapters('all'),
                  },
                  {
                    label: getString('novelScreen.download.delete'),
                    onPress: () => deleteChapters(),
                  },
                ]}
              />
            )}
            <Menu
              visible={extraMenu}
              onDismiss={() => showExtraMenu(false)}
              anchor={
                <Appbar.Action
                  icon="dots-vertical"
                  onPress={() => showExtraMenu(true)}
                  theme={{ colors: theme }}
                />
              }
              theme={theme}
              items={[
                {
                  label: getString('novelScreen.edit.info'),
                  onPress: () => {
                    showEditInfoModal(true);
                  },
                },
                {
                  label: getString('novelScreen.edit.cover'),
                  onPress: () => {
                    setCustomNovelCover();
                  },
                },
              ]}
            />
          </Animated.View>
        )}
      </Appbar.Header>
    </Animated.View>
  );
};

export default NovelAppbar;
