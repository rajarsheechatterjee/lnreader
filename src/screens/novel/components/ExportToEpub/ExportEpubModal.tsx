import React, { useMemo } from 'react';
import { Portal } from 'react-native-paper';
import ChooseEpubLocationModal from './ChooseEpubLocationModal';
import { StatusBar } from 'react-native';
import { ThemeColors } from '@theme/types';

import EpubBuilder from '@cd-z/react-native-epub-creator';
import { ChapterInfo, NovelInfo } from '@database/types';

import { useChapterReaderSettings } from '@hooks/persisted';
import { showToast } from '@utils/showToast';
import { NOVEL_STORAGE } from '@utils/Storages';
import FileManager from '@native/FileManager';
import color from 'color';
//@ts-ignore
import css from '../../../../../android/app/src/main/assets/css/index';
// import style from './index.css';

interface ExportEpubModalProps {
  theme: ThemeColors;
  novel: NovelInfo;
  chapters: ChapterInfo[];
  isVisible: boolean;
  onClose: () => void;
}

const ExportEpubModal: React.FC<ExportEpubModalProps> = ({
  theme,
  novel,
  chapters,
  isVisible,
  onClose,
}) => {
  const readerSettings = useChapterReaderSettings();
  const {
    epubUseAppTheme = false,
    epubUseCustomCSS = false,
    epubUseCustomJS = false,
  } = useChapterReaderSettings();

  const epubStyle = useMemo(
    () =>
      `${
        epubUseAppTheme
          ? `
             :root {
               --StatusBar-currentHeight: ${StatusBar.currentHeight};
               --readerSettings-theme: ${readerSettings.theme};
               --readerSettings-padding: ${readerSettings.padding}%;
               --readerSettings-textSize: ${readerSettings.textSize / 10}rem;
               --readerSettings-textColor: ${readerSettings.textColor};
               --readerSettings-textAlign: ${readerSettings.textAlign};
               --readerSettings-lineHeight: ${readerSettings.lineHeight}rem;
               --theme-primary: ${theme.primary};
               --theme-onPrimary: ${theme.onPrimary};
               --theme-secondary: ${theme.secondary};
               --theme-tertiary: ${theme.tertiary};
               --theme-onTertiary: ${theme.onTertiary};
               --theme-onSecondary: ${theme.onSecondary};
               --theme-surface: ${theme.surface};
               --theme-surface-0-9: ${color(theme.surface)
                 .alpha(0.9)
                 .toString()};
               --theme-onSurface: ${theme.onSurface};
               --theme-surfaceVariant: ${theme.surfaceVariant};
               --theme-onSurfaceVariant: ${theme.onSurfaceVariant};
               --theme-outline: ${theme.outline};
               --theme-rippleColor: ${theme.rippleColor};
             }
             ` + (css as string).replace(/chapter/g, '#chapter')
          : ''
      }
      ${
        epubUseCustomCSS
          ? readerSettings.customCSS
              .replace(
                RegExp(`\#sourceId-${novel.pluginId}\\s*\\{`, 'g'),
                'body {',
              )
              .replace(
                RegExp(`\#sourceId-${novel.pluginId}[^\.\#A-Z]*`, 'gi'),
                '',
              )
          : ''
      }`,
    [novel, epubUseAppTheme, readerSettings, epubUseCustomCSS],
  );

  const epubJS = useMemo(
    () =>
      `
        let novelName = "${novel.name}";
        let chapterName = "";
        let sourceId =${novel.pluginId};
        let chapterId ="";
        let novelId =${novel.id};
        let html = document.querySelector("#chapter").innerHTML;
          
        ${readerSettings.customJS}
        `,
    [novel, readerSettings],
  );

  const createEpub = async (uri: string) => {
    var epub = new EpubBuilder(
      {
        title: novel.name,
        language: 'en',
        cover: novel.cover,
        description: novel.summary,
        author: novel.author,
        bookId: novel.pluginId.toString(),
        stylesheet: epubStyle || undefined,
        js: epubUseCustomJS ? epubJS : undefined,
      },
      uri,
    );

    try {
      await epub.prepare();

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`;
        if (await FileManager.exists(filePath)) {
          const downloaded = FileManager.readFile(filePath);

          await epub.addChapter({
            title:
              chapter.name?.trim() ?? 'Chapter ' + (chapter.chapterNumber || i),
            fileName: 'Chapter' + i,
            htmlBody: `<div id="chapter" data-plugin-id='${novel.pluginId}' data-novel-id='${chapter.novelId}' data-chapter-id='${chapter.id}'>${downloaded}</div>`,
          });
        }
      }
      var epubFilePath = await epub.save();
      showToast('Epub file saved at: ' + epubFilePath);
    } catch (error) {
      console.error(error);
      showToast('Cannot create because: ' + error);
      await epub.discardChanges();
    }
  };

  return (
    <Portal>
      <ChooseEpubLocationModal
        isVisible={isVisible}
        hideModal={onClose}
        onSubmit={createEpub}
      />
    </Portal>
  );
};
export default ExportEpubModal;
