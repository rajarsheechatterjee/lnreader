import React, { useRef, useCallback, useState, useEffect } from 'react';
import { DrawerLayoutAndroid } from 'react-native';

import { useChapterGeneralSettings, useTheme } from '@hooks/persisted';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';

import WebViewReader from './components/WebViewReader';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import ChapterDrawer from './components/ChapterDrawer';
import { ErrorScreenV2 } from '@components';
import { ChapterScreenProps } from '@navigators/types';
import WebView from 'react-native-webview';
import { getString } from '@strings/translations';
import KeepScreenAwake from './components/KeepScreenAwake';
import useChapter from './hooks/useChapter';
import { ChapterContextProvider, useChapterContext } from './ChapterContext';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useBackHandler } from '@hooks/index';
import { get } from 'lodash-es';

const Chapter = ({ route, navigation }: ChapterScreenProps) => {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);
  return (
    <ChapterContextProvider
      novel={route.params.novel}
      initialChapter={route.params.chapter}
    >
      <DrawerLayoutAndroid
        ref={drawerRef}
        onDrawerOpen={() => {
          drawerRef.current?.setState(prev => ({ ...prev, isOpen: true }));
        }}
        onDrawerClose={() => {
          drawerRef.current?.setState(prev => ({ ...prev, isOpen: false }));
        }}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={() => <ChapterDrawer />}
      >
        <ChapterContent
          route={route}
          navigation={navigation}
          drawerRef={drawerRef}
        />
      </DrawerLayoutAndroid>
    </ChapterContextProvider>
  );
};

type ChapterContentProps = ChapterScreenProps & {
  drawerRef: React.RefObject<DrawerLayoutAndroid>;
};

export const ChapterContent = ({
  navigation,
  drawerRef,
}: ChapterContentProps) => {
  const { novel, chapter } = useChapterContext();
  const webViewRef = useRef<WebView>(null);
  const readerSheetRef = useRef<BottomSheetModalMethods>(null);
  const theme = useTheme();
  const { pageReader = false, keepScreenOn } = useChapterGeneralSettings();
  const [bookmarked, setBookmarked] = useState(chapter.bookmark);

  useEffect(() => {
    setBookmarked(chapter.bookmark);
  }, [chapter]);

  const {
    hidden,
    loading,
    error,
    prevChapter,
    nextChapter,
    chapterText,
    saveProgress,
    hideHeader,
    navigateChapter,
    refetch,
  } = useChapter(webViewRef);

  const scrollToStart = () =>
    requestAnimationFrame(() => {
      webViewRef?.current?.injectJavaScript(
        !pageReader
          ? `(()=>{
                window.scrollTo({top:0,behavior:'smooth'})
              })()`
          : `(()=>{
              document.querySelector('chapter').setAttribute('data-page',0);
              document.querySelector("chapter").style.transform = 'translate(0%)';
            })()`,
      );
    });

  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
    hideHeader();
  }, [drawerRef, hideHeader]);

  useBackHandler(() => {
    if (get(drawerRef.current?.state, 'isOpen')) {
      drawerRef.current?.closeDrawer();
      return true;
    }
    return false;
  });

  if (error) {
    return (
      <ErrorScreenV2
        error={error}
        actions={[
          {
            iconName: 'refresh',
            title: getString('common.retry'),
            onPress: refetch,
          },
          {
            iconName: 'earth',
            title: 'WebView',
            onPress: () =>
              navigation.navigate('WebviewScreen', {
                name: novel.name,
                url: chapter.path,
                pluginId: novel.pluginId,
              }),
          },
        ]}
      />
    );
  }
  return (
    <>
      {keepScreenOn ? <KeepScreenAwake /> : null}
      {loading ? (
        <ChapterLoadingScreen />
      ) : (
        <WebViewReader
          html={chapterText}
          nextChapter={nextChapter}
          webViewRef={webViewRef}
          saveProgress={saveProgress}
          onPress={hideHeader}
          navigateChapter={navigateChapter}
        />
      )}
      <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
      {!hidden ? (
        <>
          <ReaderAppbar
            goBack={navigation.goBack}
            theme={theme}
            bookmarked={bookmarked}
            setBookmarked={setBookmarked}
          />
          <ReaderFooter
            theme={theme}
            nextChapter={nextChapter}
            prevChapter={prevChapter}
            readerSheetRef={readerSheetRef}
            scrollToStart={scrollToStart}
            navigateChapter={navigateChapter}
            navigation={navigation}
            openDrawer={openDrawer}
          />
        </>
      ) : null}
    </>
  );
};

export default Chapter;
