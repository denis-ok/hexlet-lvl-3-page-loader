/* eslint-disable no-use-before-define, no-shadow */
import axios from 'axios';
import path from 'path';
import fs from 'mz/fs';
import { getAbsFileUrls, changeHtmlUrls, genFilename, genOutputPath, genLocalFilename } from './utils';

const loadPage = (inputUrl, outputPath) => {
  const htmlFilename = genFilename(inputUrl, 'html');
  const htmlFilepath = genOutputPath(outputPath, htmlFilename);
  const filesDirname = genFilename(inputUrl, 'files');
  const filesPath = genOutputPath(outputPath, filesDirname);

  console.log('save .html to:', htmlFilepath);
  console.log('save files to:', filesPath);

  createDirForFiles(filesPath);

  return getData(inputUrl)
    .then((data) => {
      const filesToDownload = getAbsFileUrls(data, inputUrl);
      const modifiedHtml = changeHtmlUrls(data, inputUrl);
      writeHtmlFile(htmlFilepath, modifiedHtml);
      return getAllFiles(filesToDownload, filesPath);
    })
    .catch((err) => {
      console.log('.catch from loadPage func:\n', err.message);
      return err;
    });
};

const getData = url =>
  axios.get(url, { responseType: 'arraybuffer' })
    .then(res =>
      res.data)
    .catch((err) => {
      console.log('.catch from getData func:\n', err.message);
      return err;
    });

const writeHtmlFile = (filepath, data) =>
  fs.writeFile(filepath, data)
    .then(() => console.log('html saved to:', filepath))
    .catch((err) => {
      console.log('.catch from writeFile func:\n', err.message);
      return err;
    });

const createDirForFiles = path =>
  fs.mkdir(path)
    .catch((err) => {
      console.log('.catch from createDirForFiles func:\n', err.message);
      return err;
    });

const getFile = (urlStr, pathForFiles) => {
  const filename = genLocalFilename(urlStr);
  const filepath = path.join(pathForFiles, filename);

  return getData(urlStr)
    .then(data => fs.writeFile(filepath, data))
    .catch((err) => {
      console.log('.catch from getFile func:\n', err.message);
      return err;
    });
};

const getAllFiles = (urls, path) =>
  Promise.all(urls.map(url => getFile(url, path)));

export default loadPage;
