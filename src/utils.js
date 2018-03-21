/* eslint-disable no-use-before-define, no-shadow */

import path from 'path';
import cheerio from 'cheerio';
import url from 'url';

const getFileUrls = (html) => {
  const $ = cheerio.load(html);
  const imgArr = $('img').map((i, el) => $(el).attr('src')).get();
  const scriptArr = $('script').map((i, el) => $(el).attr('src')).get();
  const linkArr = $('link').map((i, el) => $(el).attr('href')).get();
  return [...imgArr, ...scriptArr, ...linkArr];
};

const isRelative = (urlStr) => {
  const urlObj = url.parse(urlStr);
  return !urlObj.protocol && !urlObj.host;
};

const toAbsolute = (urlStr, inputUrl) => {
  if (isRelative(urlStr)) {
    const { protocol, hostname } = url.parse(inputUrl);
    return url.format({
      protocol,
      hostname,
      pathname: urlStr,
    });
  }

  return urlStr;
};

const getAbsFileUrls = (html, inputUrl) =>
  getFileUrls(html).map(url => toAbsolute(url, inputUrl));

const genLocalFilename = (urlStr) => {
  const { pathname } = url.parse(urlStr);
  const filename = pathname.slice(1).split('/').join('-');
  return filename;
};

const genFilename = (inputUrl, option = 'html') => {
  const options = {
    html: '.html',
    files: '_files',
  };
  const { host, port, path } = url.parse(inputUrl);
  const parts = path === '/' ? [host, port] : [host, port, path];
  const formatted = parts.join('').replace(/[^a-z0-9]/gi, '-');
  return `${formatted}${options[option]}`;
};

const genOutputPath = (outputPath = __dirname, filename) =>
  path.join(outputPath, filename);

const genLocalFilepath = (urlStr, inputUrl) =>
  path.join(genFilename(inputUrl, 'files'), genLocalFilename(urlStr));


const changeHtmlUrls = (html, inputUrl) => {
  const options = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: false,
  };

  const $ = cheerio.load(html, options);
  $('[src], [href]').each((i, el) => {
    const current = $(el);
    if (current.is('img') || current.is('script')) {
      const value = current.attr('src');
      const newValue = genLocalFilepath(value, inputUrl);
      return current.attr('src', newValue);
    }
    if (current.is('link')) {
      const value = current.attr('href');
      const newValue = genLocalFilepath(value, inputUrl);
      return current.attr('href', newValue);
    }
    return true;
  });
  return $.html();
};

export { getAbsFileUrls, changeHtmlUrls, genFilename, genOutputPath, genLocalFilename };

// const $clone = $.root().clone();


// $('img').each((i, el) => {
//   const srcValue = $(el).attr('src');
//   const newValue = genLocalFilepath(srcValue, inputUrl);
//   return $(el).attr('src', newValue);
// });
