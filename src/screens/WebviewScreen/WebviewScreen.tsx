import React, { useRef, useState } from 'react';
import WebView, { WebViewNavigation } from 'react-native-webview';
import { ProgressBar } from 'react-native-paper';

import { useTheme } from '@hooks/persisted';
import { WebviewScreenProps } from '@navigators/types';
import { getUserAgent } from '@hooks/persisted/useUserAgent';
import { expandURL } from '@services/plugin/fetch';
import Appbar from './components/Appbar';

const WebviewScreen = ({ route, navigation }: WebviewScreenProps) => {
  const { name, url, pluginId, isNovel } = route.params;

  const theme = useTheme();
  const webViewRef = useRef<WebView | null>(null);

  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState(name || '');
  const [currentUrl, setCurrentUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const handleNavigation = (e: WebViewNavigation) => {
    setTitle(e.title);
    setCurrentUrl(e.url);
    setCanGoBack(e.canGoBack);
    setCanGoForward(e.canGoForward);
  };

  return (
    <>
      <Appbar
        title={title}
        theme={theme}
        currentUrl={currentUrl}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        webView={webViewRef}
        navigation={navigation}
      />
      <ProgressBar
        color={theme.primary}
        progress={progress}
        visible={progress !== 1}
      />
      <WebView
        startInLoadingState
        userAgent={getUserAgent()}
        ref={webViewRef}
        source={{
          uri: pluginId ? expandURL(pluginId, isNovel || false, url) : url,
        }}
        onLoadProgress={({ nativeEvent }) => {
          setProgress(nativeEvent.progress);
        }}
        onNavigationStateChange={handleNavigation}
      />
    </>
  );
};

export default WebviewScreen;
