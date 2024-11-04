import React, { useCallback, useMemo, useState, memo } from 'react';
import {
  Pressable,
  Image,
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBrowseSettings, usePlugins } from '@hooks/persisted';
import { PluginItem } from '@plugins/types';
import {
  FlashList,
  ListRenderItem as FlashListRenderItem,
  ListRenderItemInfo,
} from '@shopify/flash-list';
import { coverPlaceholderColor } from '@theme/colors';
import { ThemeColors } from '@theme/types';
import { Swipeable } from 'react-native-gesture-handler';
import { getString } from '@strings/translations';
import { BrowseScreenProps, MoreStackScreenProps } from '@navigators/types';
import { Button, EmptyView, IconButtonV2 } from '@components';
import TrackerCard from '../discover/TrackerCard';
import { showToast } from '@utils/showToast';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Portal } from 'react-native-paper';
import SourceSettingsModal from './Modals/SourceSettings';
import { useBoolean } from '@hooks';
import { getPlugin } from '@plugins/pluginManager';

interface AvailableTabProps {
  searchText: string;
  theme: ThemeColors;
}

interface InstalledTabProps {
  navigation: BrowseScreenProps['navigation'];
  theme: ThemeColors;
  searchText: string;
}

export const InstalledTab = memo(
  ({ navigation, theme, searchText }: InstalledTabProps) => {
    const {
      filteredInstalledPlugins,
      lastUsedPlugin,
      setLastUsedPlugin,
      uninstallPlugin,
      updatePlugin,
    } = usePlugins();
    const { showMyAnimeList, showAniList } = useBrowseSettings();
    const settingsModal = useBoolean();
    const [selectedPluginId, setSelectedPluginId] = useState<string>('');

    const pluginSettings = getPlugin(selectedPluginId)?.pluginSettings;

    const navigateToSource = useCallback(
      (plugin: PluginItem, showLatestNovels?: boolean) => {
        navigation.navigate('SourceScreen', {
          pluginId: plugin.id,
          pluginName: plugin.name,
          site: plugin.site,
          showLatestNovels,
        });
        setLastUsedPlugin(plugin);
      },
      [],
    );

    const searchedPlugins = useMemo(() => {
      const sortedInstalledPlugins = filteredInstalledPlugins.sort(
        (plgFirst, plgSecond) => plgFirst.name.localeCompare(plgSecond.name),
      );
      if (searchText) {
        const lowerCaseSearchText = searchText.toLocaleLowerCase();
        return sortedInstalledPlugins.filter(
          plg =>
            plg.name.toLocaleLowerCase().includes(lowerCaseSearchText) ||
            plg.id.includes(lowerCaseSearchText),
        );
      } else {
        return sortedInstalledPlugins;
      }
    }, [searchText, filteredInstalledPlugins]);

    const renderItem: FlashListRenderItem<PluginItem> = useCallback(
      ({ item }) => {
        return (
          <Swipeable
            dragOffsetFromLeftEdge={30}
            dragOffsetFromRightEdge={30}
            renderLeftActions={(progress, dragX, ref) => {
              return (
                <View
                  style={[
                    styles.buttonGroup,
                    { backgroundColor: theme.inverseSurface },
                  ]}
                >
                  <IconButtonV2
                    name="earth"
                    size={22}
                    color={theme.inverseOnSurface}
                    onPress={() => {
                      ref.close();
                      navigation.navigate('WebviewScreen', {
                        name: item.name,
                        url: item.site,
                        pluginId: item.id,
                      });
                    }}
                    theme={theme}
                  />
                </View>
              );
            }}
            renderRightActions={(progress, dragX, ref) => (
              <View
                style={[styles.buttonGroup, { backgroundColor: theme.error }]}
              >
                <IconButtonV2
                  name="delete"
                  size={22}
                  color={theme.onError}
                  onPress={() => {
                    ref.close();
                    uninstallPlugin(item).then(() =>
                      showToast(
                        getString('browseScreen.uninstalledPlugin', {
                          name: item.name,
                        }),
                      ),
                    );
                  }}
                  theme={theme}
                />
              </View>
            )}
          >
            <Pressable
              style={[styles.container, { backgroundColor: theme.surface }]}
              android_ripple={{ color: theme.rippleColor }}
              onPress={() => navigateToSource(item)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={{ uri: item.iconUrl }}
                  style={[styles.icon, { backgroundColor: theme.surface }]}
                />
                <View style={styles.details}>
                  <Text
                    numberOfLines={1}
                    style={[{ color: theme.onSurface }, styles.name]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[{ color: theme.onSurfaceVariant }, styles.addition]}
                  >
                    {`${item.lang} - ${item.version}`}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }} />
              {item.hasSettings ? (
                <IconButtonV2
                  name="cog-outline"
                  size={22}
                  color={theme.primary}
                  onPress={() => {
                    setSelectedPluginId(item.id);
                    settingsModal.setTrue();
                  }}
                  theme={theme}
                />
              ) : null}
              {item.hasUpdate || __DEV__ ? (
                <IconButtonV2
                  name="download-outline"
                  size={22}
                  color={theme.primary}
                  onPress={() => {
                    updatePlugin(item)
                      .then(version =>
                        showToast(
                          getString('browseScreen.updatedTo', { version }),
                        ),
                      )
                      .catch((error: Error) => showToast(error.message));
                  }}
                  theme={theme}
                />
              ) : null}
              <Button
                title={getString('browseScreen.latest')}
                textColor={theme.primary}
                onPress={() => navigateToSource(item, true)}
              />
            </Pressable>
          </Swipeable>
        );
      },
      [theme, searchedPlugins],
    );

    return (
      <FlashList
        estimatedItemSize={64}
        data={searchedPlugins}
        extraData={theme}
        renderItem={renderItem}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id + '_installed'}
        ListHeaderComponent={
          <>
            {showMyAnimeList || showAniList ? (
              <>
                <Text
                  style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
                >
                  {getString('browseScreen.discover')}
                </Text>
                {showAniList ? (
                  <TrackerCard
                    theme={theme}
                    icon={require('../../../../assets/anilist.png')}
                    trackerName="Anilist"
                    onPress={() => navigation.navigate('BrowseAL')}
                  />
                ) : null}
                {showMyAnimeList ? (
                  <TrackerCard
                    theme={theme}
                    icon={require('../../../../assets/mal.png')}
                    trackerName="MyAnimeList"
                    onPress={() => navigation.navigate('BrowseMal')}
                  />
                ) : null}
              </>
            ) : null}
            {lastUsedPlugin ? (
              <>
                <Text
                  style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
                >
                  {getString('browseScreen.lastUsed')}
                </Text>
                {renderItem({
                  item: lastUsedPlugin,
                  index: 0,
                } as ListRenderItemInfo<PluginItem>)}
              </>
            ) : null}
            <Text
              style={[styles.listHeader, { color: theme.onSurfaceVariant }]}
            >
              {getString('browseScreen.installedPlugins')}
            </Text>

            <Portal>
              <SourceSettingsModal
                visible={settingsModal.value}
                onDismiss={settingsModal.setFalse}
                title={getString('browseScreen.settings.title')}
                description={getString('browseScreen.settings.description')}
                pluginId={selectedPluginId}
                pluginSettings={pluginSettings}
              />
            </Portal>
          </>
        }
      />
    );
  },
);

interface AvailablePluginCardProps {
  plugin: PluginItem & { header: boolean };
  theme: ThemeColors;
  installPlugin: (plugin: PluginItem) => Promise<void>;
}

const AvailablePluginCard = ({
  plugin,
  theme,
  installPlugin,
}: AvailablePluginCardProps) => {
  const ratio = useSharedValue(1);
  const imageStyles = useAnimatedStyle(() => ({
    height: ratio.value * 40,
  }));
  const viewStyles = useAnimatedStyle(() => ({
    height: ratio.value * 64,
    paddingVertical: ratio.value * 12,
  }));
  const textStyles = useAnimatedStyle(() => ({
    lineHeight: ratio.value * 20,
  }));
  return (
    <View>
      {plugin.header ? (
        <Text style={[styles.listHeader, { color: theme.onSurfaceVariant }]}>
          {plugin.lang}
        </Text>
      ) : null}
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme.surface },
          viewStyles,
        ]}
      >
        <Animated.View style={{ flexDirection: 'row' }}>
          <Animated.Image
            source={{ uri: plugin.iconUrl }}
            style={[
              styles.icon,
              imageStyles,
              { backgroundColor: theme.surface },
            ]}
          />
          <Animated.View style={styles.details}>
            <Animated.Text
              numberOfLines={1}
              style={[
                {
                  color: theme.onSurface,
                },
                styles.name,
                textStyles,
              ]}
            >
              {plugin.name}
            </Animated.Text>
            <Animated.Text
              numberOfLines={1}
              style={[
                { color: theme.onSurfaceVariant },
                styles.addition,
                textStyles,
              ]}
            >
              {`${plugin.lang} - ${plugin.version}`}
            </Animated.Text>
          </Animated.View>
        </Animated.View>
        <IconButtonV2
          name="download-outline"
          color={theme.primary}
          onPress={() => {
            ratio.value = withTiming(0, { duration: 500 });
            installPlugin(plugin)
              .then(() => {
                showToast(
                  getString('browseScreen.installedPlugin', {
                    name: plugin.name,
                  }),
                );
              })
              .catch((error: Error) => {
                showToast(error.message);
                ratio.value = 1;
              });
          }}
          size={22}
          theme={theme}
        />
      </Animated.View>
    </View>
  );
};

export const AvailableTab = memo(({ searchText, theme }: AvailableTabProps) => {
  const navigation = useNavigation<MoreStackScreenProps['navigation']>();

  const [refreshing, setRefreshing] = useState(false);
  const { filteredAvailablePlugins, refreshPlugins, installPlugin } =
    usePlugins();

  const searchedPlugins = useMemo(() => {
    let res = filteredAvailablePlugins;
    if (searchText) {
      const lowerCaseSearchText = searchText.toLocaleLowerCase();
      res = filteredAvailablePlugins.filter(
        plg =>
          plg.name.toLocaleLowerCase().includes(lowerCaseSearchText) ||
          plg.id.includes(lowerCaseSearchText),
      );
    }
    let previousLang: string | null = null;
    return res
      .sort((a, b) => a.lang.localeCompare(b.lang))
      .map(plg => {
        if (plg.lang !== previousLang) {
          previousLang = plg.lang;
          return { ...plg, header: true };
        } else {
          return { ...plg, header: false };
        }
      });
  }, [searchText, filteredAvailablePlugins]);

  const renderItem: FlashListRenderItem<PluginItem & { header: boolean }> =
    useCallback(
      ({ item }) => {
        return (
          <AvailablePluginCard
            plugin={item}
            theme={theme}
            installPlugin={installPlugin}
          />
        );
      },
      [theme, searchedPlugins],
    );

  return (
    <FlashList
      estimatedItemSize={64}
      data={searchedPlugins}
      extraData={theme}
      renderItem={renderItem}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      keyExtractor={item => item.id + '_available'}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            refreshPlugins()
              .finally(() => setRefreshing(false))
              .catch(e => {
                showToast(e);
              });
          }}
          colors={[theme.onPrimary]}
          progressBackgroundColor={theme.primary}
        />
      }
      ListEmptyComponent={
        <View style={{ marginTop: 100 }}>
          <EmptyView
            icon="(･Д･。"
            description=" No repositories yet. Add your first plugin repository to get
                started."
            actions={[
              {
                iconName: 'cog-outline',
                title: 'Add Repository',
                onPress: () =>
                  navigation.navigate('MoreStack', {
                    screen: 'SettingsStack',
                    params: {
                      screen: 'SubScreen',
                      params: { settingsSource: 'repo' },
                    },
                  }),
              },
            ]}
            theme={theme}
          />
        </View>
      }
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  listHeader: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontWeight: '600',
  },
  icon: {
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  details: {
    marginLeft: 16,
  },
  addition: {
    fontSize: 12,
    lineHeight: 20,
  },
  name: {
    fontWeight: 'bold',
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
