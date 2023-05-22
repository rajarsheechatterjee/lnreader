import dayjs from 'dayjs';
import * as cheerio from 'cheerio';
import { htmlToText } from '../helpers/htmlToText';
import { Status, defaultCoverUri } from '../helpers/constants';
import { FilterInputs } from '../types/filterTypes';

const sourceId = 119;
const sourceName = 'РанобэРФ';

const baseUrl = 'https://ранобэ.рф';

const popularNovels = async (page, { showLatestNovels, filters }) => {
  let url = baseUrl + '/books?order=';
  url += showLatestNovels ? 'lastPublishedChapter' : filters?.sort || 'popular';
  url += '&page=' + page;

  const result = await fetch(url);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let json = loadedCheerio('#__NEXT_DATA__').html();
  json = JSON.parse(json);

  let novels = [];
  json.props.pageProps.totalData.items.forEach(novel =>
    novels.push({
      sourceId,
      novelName: novel.title,
      novelCover: novel?.verticalImage?.url
        ? baseUrl + novel.verticalImage.url
        : defaultCoverUri,
      novelUrl: baseUrl + '/' + novel.slug,
    }),
  );

  return { novels };
};

const parseNovelAndChapters = async novelUrl => {
  const result = await fetch(novelUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let json = loadedCheerio('#__NEXT_DATA__').html();
  json = JSON.parse(json);

  let novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    novelName: json.props.pageProps.book.title,
    novelCover: json.props.pageProps.book?.verticalImage?.url
      ? baseUrl + json.props.pageProps.book.verticalImage.url
      : defaultCoverUri,
    summary: htmlToText(json.props.pageProps.book.description),
    author: json.props.pageProps.book?.author || '',
    genre: json.props.pageProps.book.genres.map(item => item.title).join(','),
    status: json.props.pageProps.book.additionalInfo.includes('Активен')
      ? Status.ONGOING
      : Status.COMPLETED,
  };

  let chapters = [];

  json.props.pageProps.book.chapters.forEach(item => {
    const chapterName = item.title;
    const releaseDate = dayjs(item.publishedAt).format('LLL');
    const chapterUrl = baseUrl + item.url;

    if (!item.isDonate || item.isUserPaid) {
      chapters.push({ chapterName, releaseDate, chapterUrl });
    }
  });

  novel.chapters = chapters.reverse();
  return novel;
};

const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();

  const loadedCheerio = cheerio.load(body);
  let json = loadedCheerio('#__NEXT_DATA__').html();
  json = JSON.parse(json);

  const chapterName = json.props.pageProps.chapter.title;
  let temp = cheerio.load(json.props.pageProps.chapter.content.text);

  temp('img').each(function () {
    if (!loadedCheerio(this).attr('src')?.startsWith('http')) {
      let src = loadedCheerio(this).attr('src');
      loadedCheerio(this).attr('src', baseUrl + src);
    }
  });

  const chapterText = temp.html();
  const chapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName,
    chapterText,
  };

  return chapter;
};

const searchNovels = async searchTerm => {
  const url = `${baseUrl}/v3/books?filter[or][0][title][like]=${searchTerm}&filter[or][1][titleEn][like]=${searchTerm}&filter[or][2][fullTitle][like]=${searchTerm}&filter[status][]=active&filter[status][]=abandoned&filter[status][]=completed&expand=verticalImage`;
  const result = await fetch(url);
  const body = await result.json();
  let novels = [];

  body.items.forEach(novel =>
    novels.push({
      sourceId,
      novelName: novel.title,
      novelCover: novel?.verticalImage?.url
        ? baseUrl + novel.verticalImage.url
        : defaultCoverUri,
      novelUrl: baseUrl + '/' + novel.slug,
    }),
  );

  return novels;
};

const filters = [
  {
    key: 'sort',
    label: 'Сортировка',
    values: [
      { label: 'Рейтинг', value: 'popular' },
      { label: 'Дате добавления', value: 'new' },
      { label: 'Дате обновления', value: 'lastPublishedChapter' },
      { label: 'Законченные', value: 'completed' },
    ],
    inputType: FilterInputs.Picker,
  },
];

const RanobeRFScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
  filters,
};

export default RanobeRFScraper;
