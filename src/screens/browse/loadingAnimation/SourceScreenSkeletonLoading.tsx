import React, { memo, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { ThemeColors } from '@theme/types';
import getLoadingColors from '@utils/getLoadingColors';
import LoadingNovel from '@screens/browse/loadingAnimation/LoadingNovel';
import { useLibrarySettings } from '@hooks/persisted';
import { DisplayModes } from '@screens/library/constants/constants';
import { useDeviceOrientation } from '@hooks';

interface Props {
  theme: ThemeColors;
  completeRow?: number;
}

const SourceScreenSkeletonLoading: React.FC<Props> = ({
  theme,
  completeRow,
}) => {
  const [highlightColor, backgroundColor] = getLoadingColors(theme);

  const { displayMode = DisplayModes.Comfortable, novelsPerRow = 2 } =
    useLibrarySettings();

  const window = useWindowDimensions();
  const styles = createStyleSheet();

  const orientation = useDeviceOrientation();

  const numColumns = useMemo(
    () => (orientation === 'landscape' ? 6 : novelsPerRow + 1),
    [orientation, novelsPerRow],
  );

  const [pictureHeight, pictureWidth] = useMemo(() => {
    let height = (window.width / numColumns) * (4 / 3);
    let width = (window.width - 12 - 9.6 * numColumns) / numColumns;
    return [height, width];
  }, [numColumns, window.width]);

  const renderLoadingNovel = (item: number) => {
    let randomNumber = Math.random();
    randomNumber < 0.1 ? (randomNumber = 0) : null;
    return (
      <View key={'sourceLoading' + item} style={{ flex: 1 / numColumns }}>
        <LoadingNovel
          backgroundColor={backgroundColor}
          highlightColor={highlightColor}
          pictureHeight={pictureHeight}
          pictureWidth={pictureWidth}
          displayMode={displayMode}
        />
      </View>
    );
  };
  const renderLoading = (item: number) => {
    const offset = Math.pow(10, item);
    const items: Array<number> = [1 * offset];
    if (displayMode !== DisplayModes.List) {
      for (let i = 2; i <= numColumns; i++) {
        items.push(i * offset);
      }
    }
    return (
      <View key={'sourceSkeletonRow' + item} style={styles.row}>
        {items.map(renderLoadingNovel)}
      </View>
    );
  };
  let items: Array<number> = [];
  if (completeRow === 1) {
    return renderLoadingNovel(completeRow);
  }

  if (displayMode === DisplayModes.List) {
    items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  } else {
    for (let i = 1; i * pictureHeight < window.height - 100; i++) {
      items.push(i);
    }
  }

  return <View style={styles.container}>{items.map(renderLoading)}</View>;
};

const createStyleSheet = () => {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      marginHorizontal: 2,
      marginBottom: 8,
      marginTop: 2,
      overflow: 'visible',
    },
    row: {
      flexDirection: 'row',
      paddingHorizontal: 1,
    },
    completeRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 1,
      marginBottom: 8,
      position: 'relative',
      right: 0,
      opacity: 0.8,
    },
  });
};

export default memo(SourceScreenSkeletonLoading);
