import { View, ScrollView, StatusBar, Text } from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { dummyHTML } from './utils';

import { Appbar, List } from '@components/index';

import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
  useTheme,
} from '@hooks/persisted';
import { getString } from '@strings/translations';

import GeneralSettings from './Settings/GeneralSettings';
import CustomCSSSettings from './Settings/CustomCSSSettings';
import CustomJSSettings from './Settings/CustomJSSettings';
import DisplaySettings from './Settings/DisplaySettings';
import ReaderThemeSettings from './Settings/ReaderThemeSettings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import color from 'color';
import { useBatteryLevel } from 'react-native-device-info';
import * as Speech from 'expo-speech';
import TextToSpeechSettings from './Settings/TextToSpeechSettings';

export type TextAlignments =
  | 'left'
  | 'center'
  | 'auto'
  | 'right'
  | 'justify'
  | undefined;

type WebViewPostEvent = {
  type: string;
  data?: { [key: string]: string | number };
};

const SettingsReaderScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const { bottom } = useSafeAreaInsets();
  const novel = {
    'artist': null,
    'author': 'LNReader-kun',
    'cover':
      'file:///storage/emulated/0/Android/data/com.rajarsheechatterjee.LNReader/files/Novels/lightnovelcave/16/cover.png?1717862123181',
    'genres': 'Action,Hero',
    'id': 16,
    'inLibrary': 1,
    'isLocal': 0,
    'name': 'Preview Man (LN)',
    'path': 'novel/preview-man-16091321',
    'pluginId': 'lightnovelcave',
    'status': 'Ongoing',
    'summary':
      'To preview or not preview. A question that bothered humanity for a long time, until one day… Preview Man appeared.Show More',
    'totalPages': 8,
  };
  const chapter = {
    'bookmark': 0,
    'chapterNumber': 1,
    'id': 3722,
    'isDownloaded': 1,
    'name': 'Chapter 1 - The rise of Preview Man',
    'novelId': 16,
    'page': '2',
    'path': 'novel/preview-man/chapter-1',
    'position': 0,
    'progress': 3,
    'readTime': '2100-01-01 00:00:00',
    'releaseTime': 'January 1, 2100',
    'unread': 1,
    'updatedTime': null,
  };
  const [webViewHeight, setWebViewHeight] = useState(280);
  const [hidden, setHidden] = useState(true);
  const batteryLevel = useBatteryLevel();
  const readerSettings = useChapterReaderSettings();
  const chapterGeneralSettings = useChapterGeneralSettings();
  const READER_HEIGHT = 280;
  const assetsUriPrefix = useMemo(
    () => (__DEV__ ? 'http://localhost:8081/assets' : 'file:///android_asset'),
    [],
  );
  const webViewCSS = `
  <link rel="stylesheet" href="${assetsUriPrefix}/css/index.css">
    <style>
    :root {
      --StatusBar-currentHeight: ${StatusBar.currentHeight};
      --readerSettings-theme: ${readerSettings.theme};
      --readerSettings-padding: ${readerSettings.padding}px;
      --readerSettings-textSize: ${readerSettings.textSize}px;
      --readerSettings-textColor: ${readerSettings.textColor};
      --readerSettings-textAlign: ${readerSettings.textAlign};
      --readerSettings-lineHeight: ${readerSettings.lineHeight};
      --readerSettings-fontFamily: ${readerSettings.fontFamily};
      --theme-primary: ${theme.primary};
      --theme-onPrimary: ${theme.onPrimary};
      --theme-secondary: ${theme.secondary};
      --theme-tertiary: ${theme.tertiary};
      --theme-onTertiary: ${theme.onTertiary};
      --theme-onSecondary: ${theme.onSecondary};
      --theme-surface: ${theme.surface};
      --theme-surface-0-9: ${color(theme.surface).alpha(0.9).toString()};
      --theme-onSurface: ${theme.onSurface};
      --theme-surfaceVariant: ${theme.surfaceVariant};
      --theme-onSurfaceVariant: ${theme.onSurfaceVariant};
      --theme-outline: ${theme.outline};
      --theme-rippleColor: ${theme.rippleColor};
      }
      
      @font-face {
        font-family: ${readerSettings.fontFamily};
        src: url("file:///android_asset/fonts/${
          readerSettings.fontFamily
        }.ttf");
      }
    </style>

    <style>${readerSettings.customCSS}</style>
  `;

  const readerBackgroundColor = readerSettings.theme;
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);
  return (
    <>
      <Appbar
        mode="small"
        title={getString('readerSettings.title')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />

      <View style={{ height: webViewHeight }}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          allowFileAccess={true}
          scalesPageToFit={true}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          style={{ backgroundColor: readerBackgroundColor }}
          nestedScrollEnabled={true}
          onMessage={(ev: { nativeEvent: { data: string } }) => {
            const event: WebViewPostEvent = JSON.parse(ev.nativeEvent.data);
            switch (event.type) {
              case 'hide':
                if (hidden) {
                  webViewRef.current?.injectJavaScript(
                    'reader.hidden.val = true',
                  );
                } else {
                  webViewRef.current?.injectJavaScript(
                    'reader.hidden.val = false',
                  );
                }
                setHidden(!hidden);
                break;
              case 'speak':
                if (event.data && typeof event.data === 'string') {
                  Speech.speak(event.data, {
                    onDone() {
                      webViewRef.current?.injectJavaScript('tts.next?.()');
                    },
                    voice: readerSettings.tts?.voice?.identifier,
                    pitch: readerSettings.tts?.pitch || 1,
                    rate: readerSettings.tts?.rate || 1,
                  });
                } else {
                  webViewRef.current?.injectJavaScript('tts.next?.()');
                }
                break;
              case 'stop-speak':
                Speech.stop();
                break;
            }
          }}
          source={{
            html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                ${webViewCSS}
              </head>
              <body class="${
                chapterGeneralSettings.pageReader ? 'page-reader' : ''
              }"> 
                <div id="LNReader-chapter">
                ${dummyHTML}
                </div>
                <div id="reader-ui"></div>
              </body>
              <script>
                var initialReaderConfig = ${JSON.stringify({
                  readerSettings,
                  chapterGeneralSettings,
                  novel,
                  chapter,
                  nextChapter: chapter,
                  batteryLevel,
                  autoSaveInterval: 2222,
                  DEBUG: __DEV__,
                  strings: {
                    finished: `${getString(
                      'readerScreen.finished',
                    )}: ${chapter.name.trim()}`,
                    nextChapter: getString('readerScreen.nextChapter', {
                      name: chapter.name,
                    }),
                    noNextChapter: getString('readerScreen.noNextChapter'),
                  },
                })}
              </script>
              <script src="${assetsUriPrefix}/js/icons.js"></script>
              <script src="${assetsUriPrefix}/js/van.js"></script>
              <script src="${assetsUriPrefix}/js/text-vibe.js"></script>
              <script src="${assetsUriPrefix}/js/core.js"></script>
              <script src="${assetsUriPrefix}/js/index.js"></script>
              <script>
                ${readerSettings.customJS}
              </script>
            </html>
            `,
          }}
        />
      </View>
      <View
        style={{
          width: '100%',
          height: 11,
          backgroundColor: readerBackgroundColor,
          borderBottomColor: theme.outline,
          borderBottomWidth: 2,
          marginBottom: 9,
        }}
      >
        <View
          style={{
            width: '10%',
            height: 20,
            marginHorizontal: '45%',
            backgroundColor: theme.outline,
            borderRadius: 10,
          }}
          onTouchMove={e => {
            setWebViewHeight(e.nativeEvent.pageY - 84);
          }}
        >
          <Text style={{ textAlign: 'center' }}>•••</Text>
        </View>
      </View>
      <ScrollView>
        <View style={{ paddingBottom: bottom }}>
          <GeneralSettings />
          <List.Divider theme={theme} />
          <CustomCSSSettings />
          <List.Divider theme={theme} />
          <CustomJSSettings />
          <List.Divider theme={theme} />
          <DisplaySettings />
          <List.Divider theme={theme} />
          <ReaderThemeSettings />
          <List.Divider theme={theme} />
          <TextToSpeechSettings />
        </View>
      </ScrollView>
    </>
  );
};

export default SettingsReaderScreen;
