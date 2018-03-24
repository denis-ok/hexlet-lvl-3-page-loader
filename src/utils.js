import pathLib from 'path';
import cheerio from 'cheerio';
import urlLib from 'url';
import debug from 'debug';

const logInfo = debug('page-loader:info');

const tagsAttrs = {
  img: 'src',
  script: 'src',
  link: 'href',
};

const getAttrValues = (dom, tag, attr) =>
  dom(tag).map((i, el) => dom(el).attr(attr)).get();

const getMultiAttrValues = (html, tagsAttrsObj) => {
  const dom = cheerio.load(html);
  const tags = Object.keys(tagsAttrsObj);
  const attrs = Object.values(tagsAttrsObj);

  return tags.reduce((acc, tag, i) =>
    [...acc, ...getAttrValues(dom, tag, attrs[i])], []);
};

const getFileUrlsAsIs = html => getMultiAttrValues(html, tagsAttrs);

const isUrlRelative = (urlStr) => {
  const urlObj = urlLib.parse(urlStr);
  return !urlObj.protocol && !urlObj.host;
};

const urlToAbsolute = (urlStr, inputUrl) => {
  if (isUrlRelative(urlStr)) {
    const { protocol, hostname } = urlLib.parse(inputUrl);
    return urlLib.format({
      protocol,
      hostname,
      pathname: urlStr,
    });
  }
  return urlStr;
};

const getRemoteFileUrls = (html, inputUrl) => {
  const urls = getFileUrlsAsIs(html).map(url => urlToAbsolute(url, inputUrl));
  logInfo(`Count of files to Download: ${urls.length}`);
  return urls;
};

const genLocalFilename = (urlStr) => {
  const { pathname } = urlLib.parse(urlStr);
  if (pathLib.isAbsolute(pathname)) {
    return pathLib.normalize(pathname).slice(1).split('/').join('-');
  }
  return pathLib.normalize(pathname).split('/').join('-');
};

const genFilename = (inputUrl, option = 'html') => {
  const options = {
    html: '.html',
    files: '_files',
  };
  const { host, port, path } = urlLib.parse(inputUrl);
  const parts = path === '/' ? [host, port] : [host, port, path];
  const formatted = parts.join('').replace(/[^a-z0-9]/gi, '-');
  return `${formatted}${options[option]}`;
};

const genOutputPath = (outputPath = __dirname, filename) =>
  pathLib.join(outputPath, filename);

const genLocalFilepath = (urlStr, inputUrl) =>
  pathLib.join(genFilename(inputUrl, 'files'), genLocalFilename(urlStr));

const changeHtmlUrls = (html, inputUrl) => {
  const changeTagAttrValues = (dom, tag, attr) => {
    dom(`${tag}[${attr}]`).each((i, el) => {
      const current = dom(el);
      const value = current.attr(attr);
      const newValue = genLocalFilepath(value, inputUrl);
      return current.attr(attr, newValue);
    });
  };

  const parseOptions = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: false,
  };

  const tagsAttrsObj = tagsAttrs;
  const dom = cheerio.load(html, parseOptions);
  const tags = Object.keys(tagsAttrsObj);
  const attrs = Object.values(tagsAttrsObj);

  tags.forEach((tag, i) =>
    changeTagAttrValues(dom, tag, attrs[i]));

  return dom.html();
};

export { getRemoteFileUrls, changeHtmlUrls, genFilename, genOutputPath, genLocalFilename };

