import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import color from 'color';
import { IconButton, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageURISource } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Chip } from '../../../../components';
import { coverPlaceholderColor } from '../../../../theme/colors';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';

interface CoverImageProps {
  children: React.ReactNode;
  source: ImageURISource;
  theme: ThemeColors;
  hideBackdrop: boolean;
}

interface NovelThumbnailProps {
  source: ImageURISource;
  theme: ThemeColors;
  setCustomNovelCover: () => Promise<void>;
}

interface NovelTitleProps {
  theme: ThemeColors;
  children: React.ReactNode;
  onLongPress: () => void;
  onPress: () => void;
}

const NovelInfoContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.novelInfoContainer}>{children}</View>
);

const CoverImage = ({
  children,
  source,
  theme,
  hideBackdrop,
}: CoverImageProps) => {
  if (hideBackdrop) {
    return <View>{children}</View>;
  } else {
    return (
      <ImageBackground source={source} style={styles.coverImage}>
        <View
          style={{
            flex: 1,
            backgroundColor: color(theme.background).alpha(0.7).string(),
          }}
        >
          {source.uri ? (
            <LinearGradient
              colors={['rgba(0,0,0,0)', theme.background]}
              locations={[0, 1]}
              style={styles.linearGradient}
            >
              {children}
            </LinearGradient>
          ) : (
            children
          )}
        </View>
      </ImageBackground>
    );
  }
};

const NovelThumbnail = ({
  source,
  theme,
  setCustomNovelCover,
}: NovelThumbnailProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <TouchableWithoutFeedback onPress={() => setExpanded(!expanded)}>
        <Image source={source} style={styles.novelThumbnail} />
      </TouchableWithoutFeedback>
    );
  } else {
    return (
      <Portal>
        <IconButton
          icon="pencil-outline"
          style={{
            position: 'absolute',
            top: StatusBar.currentHeight ?? 0 + 10,
            right: 10,
            zIndex: 10,
          }}
          iconColor={theme.onBackground}
          onPress={setCustomNovelCover}
        />
        <Pressable
          style={{
            position: 'absolute',
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height + 60,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
          onPress={() => setExpanded(false)}
        >
          <Image
            source={source}
            style={{
              width: Dimensions.get('window').width,
              height: (Dimensions.get('window').width * 3) / 2,
            }}
          />
        </Pressable>
      </Portal>
    );
  }
};

const NovelTitle = ({
  theme,
  children,
  onLongPress,
  onPress,
}: NovelTitleProps) => (
  <Text
    onLongPress={onLongPress}
    onPress={onPress}
    style={[styles.novelTitle, { color: theme.onBackground }]}
    numberOfLines={4}
  >
    {children}
  </Text>
);

const NovelInfo = ({
  theme,
  children,
}: {
  theme: ThemeColors;
  children: React.ReactNode;
}) => (
  <Text
    style={[styles.novelInfo, { color: theme.onSurfaceVariant }]}
    numberOfLines={1}
  >
    {children}
  </Text>
);

const FollowButton = ({
  theme,
  onPress,
  followed,
}: {
  theme: ThemeColors;
  onPress: () => void;
  followed: boolean;
}) => (
  <View style={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <Pressable
      android_ripple={{
        color: color(theme.primary).alpha(0.12).string(),
        borderless: false,
      }}
      onPress={onPress}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 8,
      }}
    >
      <IconButton
        icon={followed ? 'heart' : 'heart-outline'}
        iconColor={followed ? theme.primary : theme.outline}
        size={24}
        style={{ margin: 0 }}
      />
      <Text
        style={{
          fontSize: 12,
          color: followed ? theme.primary : theme.outline,
        }}
      >
        {followed
          ? getString('novelScreen.inLibaray')
          : getString('novelScreen.addToLibaray')}
      </Text>
    </Pressable>
  </View>
);

const TrackerButton = ({
  theme,
  isTracked,
  onPress,
}: {
  theme: ThemeColors;
  onPress: () => void;
  isTracked: boolean;
}) => (
  <View style={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <Pressable
      android_ripple={{
        color: theme.rippleColor,
        borderless: false,
      }}
      onPress={onPress}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 8,
      }}
    >
      <IconButton
        icon={isTracked ? 'check' : 'sync'}
        iconColor={isTracked ? theme.primary : theme.outline}
        size={24}
        style={{ margin: 0 }}
      />
      <Text
        style={{
          fontSize: 12,
          color: isTracked ? theme.primary : theme.outline,
        }}
      >
        {isTracked
          ? getString('novelScreen.tracked')
          : getString('novelScreen.tracking')}
      </Text>
    </Pressable>
  </View>
);

const NovelGenres = ({
  theme,
  genres,
}: {
  theme: ThemeColors;
  genres: string;
}) => {
  const data = genres.split(/,\s*/);

  return (
    <FlatList
      contentContainerStyle={styles.genreContainer}
      horizontal
      data={data}
      keyExtractor={(item, index) => 'genre' + index}
      renderItem={({ item }) => <Chip label={item} theme={theme} />}
      showsHorizontalScrollIndicator={false}
    />
  );
};

const NovelRating = ({
  theme,
  rating,
}: {
  theme: ThemeColors;
  rating: number;
}) => {
  const totalStars = 5;
  const starSize = 18;

  const getStarIcon = (index: number) => {
    if (rating >= index + 1) {
      return 'star';
    }
    if (rating >= index + 0.5) {
      return 'star-half-full';
    }
    return 'star-outline';
  };

  return (
    <View style={styles.starsContainer}>
      {Array.from({ length: totalStars }, (_, index) => (
        <IconButton
          key={index}
          icon={getStarIcon(index)}
          size={starSize}
          iconColor={theme.primary}
          style={styles.star}
        />
      ))}
    </View>
  );
};

export {
  NovelInfoContainer,
  CoverImage,
  NovelThumbnail,
  NovelTitle,
  NovelInfo,
  FollowButton,
  TrackerButton,
  NovelGenres,
  NovelRating,
};

const styles = StyleSheet.create({
  novelInfoContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 28,
    marginBottom: 0,
    paddingTop: 90,
  },
  coverImage: {},
  linearGradient: {
    flex: 1,
  },
  novelThumbnail: {
    height: 150,
    width: 100,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: coverPlaceholderColor,
  },
  novelTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  novelInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  followButton: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    paddingLeft: 4,
    borderWidth: 0,
    elevation: 0,
  },
  genreContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  genreChip: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    fontSize: 12,
    borderRadius: 50,
    textTransform: 'capitalize',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  star: {
    margin: -8,
    marginRight: -7,
  },
});
