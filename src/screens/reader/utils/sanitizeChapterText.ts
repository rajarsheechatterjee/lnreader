import { getString } from '@strings/translations';
import sanitizeHtml from 'sanitize-html';

export const sanitizeChapterText = (
  pluginId: string,
  novelName: string,
  chapterName: string,
  html: string,
): string => {
  // Sanitize the HTML to remove unwanted elements
  let sanitizedHtml = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'title']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'class', 'id'],
      div: ['class', 'id'],
      img: ['src', 'srcset', 'class', 'id'],
      ol: ['reversed', 'start', 'type'],
      p: ['class', 'id'],
      span: ['class', 'id'],
    },
    allowedSchemes: ['data', 'http', 'https', 'file'],
  });

  // Return the sanitized and updated HTML or an error message
  return (
    sanitizedHtml ||
    getString('readerScreen.emptyChapterMessage', {
      pluginId,
      novelName,
      chapterName,
    })
  );
};
