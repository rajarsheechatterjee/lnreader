import React, { memo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSettings } from '@hooks/persisted/index';

const SkeletonLines = ({
  width,
  lineHeight,
  containerWidth,
  containerHeight,
  containerMargin,
  color,
  highlightColor,
}: {
  width?: string | number;
  lineHeight: number;
  containerWidth: `${number}%` | number;
  containerHeight: `${number}%` | number;
  containerMargin?: `${number}%` | number;
  color?: string;
  highlightColor?: string;
}) => {
  const { disableLoadingAnimations } = useAppSettings();
  const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);
  const styles = createStyleSheet(
    containerWidth,
    containerHeight,
    containerMargin === undefined ? 0 : containerMargin,
    lineHeight,
  );

  const createLines = () => {
    let availableHeight: number = percentToNumberV(containerHeight) - 10;
    let res: boolean[] = [];
    let numberOfLongLines = 0;
    const height = lineHeight * 10;

    while (availableHeight > height) {
      if (Math.random() * 4 > 1 && numberOfLongLines <= 5) {
        res = [...res, true];
        availableHeight -= height;
        numberOfLongLines++;
      } else {
        res = [...res, false];
        availableHeight -= 16;
        numberOfLongLines = 0;
      }
    }
    return res;
  };
  const lines = createLines();

  const renderLoadingRect = (item: boolean, index: number) => {
    const skeletonWidth: number = width
      ? Number(width)
      : percentToNumberH('90%');

    const skeletonHeight = 1.5 * 15;
    if (typeof color !== 'string') {
      color = '#ebebeb';
    }
    if (typeof highlightColor !== 'string') {
      highlightColor = '#c5c5c5';
    }
    if (lines?.[index + 1] !== undefined && !lines[index + 1]) {
      let randomNumber: number = Math.random();
      randomNumber < 0.1 ? (randomNumber = 0.1) : null;
      return (
        <ShimmerPlaceHolder
          key={index}
          style={styles.lineDefault}
          shimmerColors={[color, highlightColor, color]}
          width={
            typeof width === 'string'
              ? percentToNumberH(skeletonWidth) * randomNumber + '%'
              : randomNumber * skeletonWidth
          }
          height={skeletonHeight}
          stopAutoRun={disableLoadingAnimations}
        />
      );
    }

    if (item) {
      return (
        <ShimmerPlaceHolder
          key={index}
          style={styles.lineDefault}
          shimmerColors={[color, highlightColor, color]}
          width={skeletonWidth}
          height={skeletonHeight}
          stopAutoRun={disableLoadingAnimations}
        />
      );
    } else {
      return <View key={index} style={styles.gap} />;
    }
  };

  return <View style={styles.container}>{lines.map(renderLoadingRect)}</View>;
};

const percentToNumberV = (number: number | string): number => {
  if (isNaN(Number(number))) {
    return (
      Dimensions.get('window').height *
      (Number(String(number).replace('%', '')) / 100)
    );
  } else {
    return Number(number);
  }
};

const percentToNumberH = (number: number | string): number => {
  if (isNaN(Number(number))) {
    return (
      Dimensions.get('window').width *
      (Number(String(number).replace('%', '')) / 100)
    );
  } else {
    return Number(number);
  }
};

const createStyleSheet = (
  containerWidth: number | `${number}%`,
  containerHeight: number | `${number}%`,
  containerMargin: number | `${number}%`,
  lineHeight: number,
) => {
  return StyleSheet.create({
    container: {
      position: 'relative',
      width: containerWidth,
      height: containerHeight,
      backgroundColor: 'transparent',
      margin: containerMargin,
      marginTop: '6%',
    },
    lineDefault: {
      marginLeft: 0,
      marginRight: 0,
      borderRadius: 8,
      marginBottom: lineHeight * 10,
    },
    gap: {
      height: lineHeight * 10,
      margin: 8,
    },
  });
};

export default memo(SkeletonLines);
