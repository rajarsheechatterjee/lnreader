import * as cheerio from 'cheerio';
import QueryString from 'qs';

import { fetchHtml } from '@utils/fetch/fetch';

import { FilterInputs } from '../../types/filterTypes';

class ReadwnScraper {
  constructor(sourceId, baseUrl, sourceName, genres) {
    this.sourceId = sourceId;
    this.baseUrl = baseUrl;
    this.sourceName = sourceName;
    this.filters = [
      {
        key: 'sort',
        label: 'Sort By',
        values: [
          { label: 'New', value: 'newstime' },
          { label: 'Popular', value: 'onclick' },
          { label: 'Updates', value: 'lastdotime' },
        ],
        inputType: FilterInputs.Picker,
      },
      {
        key: 'status',
        label: 'Status',
        values: [
          { label: 'All', value: 'all' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Ongoing', value: 'Ongoing' },
        ],
        inputType: FilterInputs.Picker,
      },
      {
        key: 'genres',
        label: 'Genre / Category',
        values: [
          { label: 'All', value: 'all' },
          { label: 'Action', value: 'action' },
          { label: 'Adventure', value: 'adventure' },
          { label: 'Comedy', value: 'comedy' },
          { label: 'Contemporary Romance', value: 'contemporary-romance' },
          { label: 'Drama', value: 'drama' },
          { label: 'Eastern Fantasy', value: 'eastern-fantasy' },
          { label: 'Fantasy', value: 'fantasy' },
          { label: 'Fantasy Romance', value: 'fantasy-romance' },
          { label: 'Game', value: 'game' },
          { label: 'Gender Bender', value: 'gender-bender' },
          { label: 'Harem', value: 'harem' },
          { label: 'Historical', value: 'historical' },
          { label: 'Horror', value: 'horror' },
          { label: 'Josei', value: 'josei' },
          { label: 'Lolicon', value: 'lolicon' },
          { label: 'Magical Realism', value: 'magical-realism' },
          { label: 'Martial Arts', value: 'martial-arts' },
          { label: 'Mecha', value: 'mecha' },
          { label: 'Mystery', value: 'mystery' },
          { label: 'Psychological', value: 'psychological' },
          { label: 'Romance', value: 'romance' },
          { label: 'School Life', value: 'school-life' },
          { label: 'Sci-fi', value: 'sci-fi' },
          { label: 'Seinen', value: 'seinen' },
          { label: 'Shoujo', value: 'shoujo' },
          { label: 'Shounen', value: 'shounen' },
          { label: 'Shounen Ai', value: 'shounen-ai' },
          { label: 'Slice of Life', value: 'slice-of-life' },
          { label: 'Sports', value: 'sports' },
          { label: 'Supernatural', value: 'supernatural' },
          { label: 'Tragedy', value: 'tragedy' },
          { label: 'Video Games', value: 'video-games' },
          { label: 'Wuxia', value: 'wuxia' },
          { label: 'Xianxia', value: 'xianxia' },
          { label: 'Xuanhuan', value: 'xuanhuan' },
          { label: 'Yaoi', value: 'yaoi' },
          ...genres.values,
        ],
      },
    ];
  }

  async popularNovels(page, { showLatestNovels, filters }) {
    const baseUrl = this.baseUrl;
    const sourceId = this.sourceId;

    const pageNo = page - 1;

    let url = baseUrl + 'list/';
    url += (filters?.genres || 'all') + '/';
    url += (filters?.status || 'all') + '-';
    url +=
      (showLatestNovels ? 'lastdotime' : filters?.sort || 'newstime') + '-';
    url += pageNo + '.html';

    const body = await fetchHtml({ url, sourceId });

    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio('li.novel-item').each(function () {
      const novelName = loadedCheerio(this).find('h4').text();
      const novelUrl = baseUrl + loadedCheerio(this).find('a').attr('href');

      const coverUri = loadedCheerio(this)
        .find('.novel-cover > img')
        .attr('data-src');

      const novelCover = baseUrl + coverUri;

      const novel = { sourceId, novelName, novelCover, novelUrl };

      novels.push(novel);
    });

    return { novels };
  }

  async parseNovelAndChapters(novelUrl) {
    const sourceId = this.sourceId;
    const baseUrl = this.baseUrl;
    const sourceName = this.sourceName;

    const url = novelUrl;

    const body = await fetchHtml({ url, sourceId });

    let loadedCheerio = cheerio.load(body);

    let novel = {
      sourceId: sourceId,
      sourceName: sourceName,
      url,
      novelUrl,
    };

    novel.novelName = loadedCheerio('h1.novel-title').text();

    const coverUri = loadedCheerio('figure.cover > img').attr('data-src');
    novel.novelCover = baseUrl + coverUri;

    novel.summary = loadedCheerio('.summary')
      .text()
      .replace('Summary', '')
      .trim();

    novel.genre = '';

    loadedCheerio('div.categories > ul > li').each(function () {
      novel.genre += loadedCheerio(this).text().trim() + ',';
    });

    loadedCheerio('div.header-stats > span').each(function () {
      if (loadedCheerio(this).find('small').text() === 'Status') {
        novel.status = loadedCheerio(this).find('strong').text();
      }
    });

    novel.genre = novel.genre.slice(0, -1);

    novel.author = loadedCheerio('span[itemprop=author]').text();

    let novelChapters = [];

    const novelId = novelUrl.replace('.html', '').replace(baseUrl, '');

    const latestChapterNo = loadedCheerio('.header-stats')
      .find('span > strong')
      .first()
      .text()
      .trim();

    let lastChapterNo = 1;
    loadedCheerio('.chapter-list li').each(function () {
      const chapterName = loadedCheerio(this)
        .find('a .chapter-title')
        .text()
        .trim();

      const chapterUrl = loadedCheerio(this).find('a').attr('href').trim();

      const releaseDate = loadedCheerio(this)
        .find('a .chapter-update')
        .text()
        .trim();

      lastChapterNo = loadedCheerio(this).find('a .chapter-no').text().trim();

      const chapter = { chapterName, releaseDate, chapterUrl };

      novelChapters.push(chapter);
    });

    // Itterate once more before loop to finish off
    lastChapterNo++;
    for (let i = lastChapterNo; i <= latestChapterNo; i++) {
      const chapterName = `Chapter ${i}`;
      const chapterUrl = `${novelId}_${i}.html`;
      const releaseDate = null;

      const chapter = { chapterName, releaseDate, chapterUrl };

      novelChapters.push(chapter);
    }

    novel.chapters = novelChapters;

    return novel;
  }

  async parseChapter(novelUrl, chapterUrl) {
    const baseUrl = this.baseUrl;
    const url = baseUrl + chapterUrl;
    const sourceId = this.sourceId;

    const body = await fetchHtml({ url, sourceId });

    const loadedCheerio = cheerio.load(body);

    const chapterName = loadedCheerio('.titles > h2').text();
    const chapterText = loadedCheerio('.chapter-content').html();

    const chapter = {
      sourceId,
      novelUrl,
      chapterUrl,
      chapterName,
      chapterText,
    };

    return chapter;
  }

  async searchNovels(searchTerm) {
    const baseUrl = this.baseUrl;
    const sourceId = this.sourceId;
    const searchUrl = `${baseUrl}e/search/index.php`;

    const body = await fetchHtml({
      url: searchUrl,
      init: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: `${baseUrl}search.html`,
          Origin: baseUrl,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        },
        method: 'POST',
        body: QueryString.stringify({
          show: 'title',
          tempid: 1,
          tbname: 'news',
          keyboard: searchTerm,
        }),
      },
    });

    const loadedCheerio = cheerio.load(body);

    let novels = [];

    loadedCheerio('li.novel-item').each(function () {
      const novelName = loadedCheerio(this).find('h4').text();
      const novelUrl = baseUrl + loadedCheerio(this).find('a').attr('href');

      const coverUri = loadedCheerio(this).find('img').attr('data-src');
      const novelCover = baseUrl + coverUri;

      const novel = {
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      };

      novels.push(novel);
    });

    return novels;
  }
}

export default ReadwnScraper;
