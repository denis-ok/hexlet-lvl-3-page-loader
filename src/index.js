/* eslint-disable no-use-before-define, no-shadow */
import axios from 'axios';
import path from 'path';
import url from 'url';
import fs from 'mz/fs';

const loadPage = (url, outputPath) =>
  getData(url)
    .then((data) => {
      const filename = genFilename(url);
      const filepath = genPathToFile(outputPath, filename);
      console.log('saving to:', filepath);
      return writeHtmlFile(filepath, data);
    })
    .catch((err) => {
      console.log('.catch from loadPage func:\n', err.message);
      return err;
    });

const genFilename = (urlStr) => {
  const { host, port, path } = url.parse(urlStr);
  const parts = path === '/' ? [host, port] : [host, port, path];
  const result = parts.join('').replace(/[^a-z0-9]/gi, '-');
  return `${result}.html`;
};

const genPathToFile = (outputPath = __dirname, filename) =>
  path.join(outputPath, filename); // normalize outputPath?

const getData = url =>
  axios.get(url, { responseType: 'arraybuffer' })
    .then(res =>
    // console.log(res.config, '\n', res.headers, '\n', res.data);
      res.data)
    .catch((err) => {
      console.log('.catch from getData func:\n', err.message);
      return err;
    });

const writeHtmlFile = (filepath, data) =>
  fs.writeFile(filepath, data)
    .then(() => filepath)
    .catch((err) => {
      console.log('.catch from writeFile func:\n', err.message);
      return err;
    });

export default loadPage;

