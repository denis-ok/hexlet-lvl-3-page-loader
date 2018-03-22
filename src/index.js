/* eslint-disable no-use-before-define, no-shadow */
import axios from 'axios';
import fs from 'mz/fs';
// import debug from 'debug';
import { getRemoteFileUrls, changeHtmlUrls, genFilename, genOutputPath, genLocalFilename } from './utils';

const loadPage = (inputUrl, outputPath) => {
  const htmlFilename = genFilename(inputUrl, 'html');
  const htmlFilepath = genOutputPath(outputPath, htmlFilename);
  const filesDirname = genFilename(inputUrl, 'files');
  const filesPath = genOutputPath(outputPath, filesDirname);

  console.log('save .html to:', htmlFilepath);
  console.log('save files to:', filesPath);

  return writeEmptyHtmlFile(htmlFilepath, '')
    .then(() => makeDirForFiles(filesPath))
    .then(() => getData(inputUrl))
    .then((htmlData) => {
      const filesToDownload = getRemoteFileUrls(htmlData, inputUrl);
      const modifiedHtml = changeHtmlUrls(htmlData, inputUrl);
      return downloadAllFiles(filesToDownload, filesPath, modifiedHtml);
    })
    .then(modifiedHtml => writeProcessedHtmlFile(htmlFilepath, modifiedHtml))

    .catch((err) => {
      console.log('.catch from loadPage func:\n', err.message);
      return err;
    });
};

const getData = url =>
  axios.get(url, { responseType: 'arraybuffer' })
    .then(res => res.data)
    .catch((err) => {
      console.log('.catch from getData func:\n', err.message);
      return err;
    });

const writeEmptyHtmlFile = (filepath, data) =>
  fs.writeFile(filepath, data)
    .then(() => console.log('Empty html saved to:', filepath))
    .catch((err) => {
      console.log('.catch from writeFile func:\n', err.message);
      return err;
    });

const writeProcessedHtmlFile = (filepath, data) =>
  fs.writeFile(filepath, data)
    .then(() => console.log('Processed html saved to:', filepath))
    .catch((err) => {
      console.log('.catch from writeFile func:\n', err.message);
      return err;
    });

const makeDirForFiles = path =>
  fs.mkdir(path)
    .catch((err) => {
      console.log('.catch from makeDirForFiles func:\n', err.message);
      return err;
    });

const downloadRemoteFile = (urlStr, pathForFiles) => {
  const filename = genLocalFilename(urlStr);
  const filepath = genOutputPath(pathForFiles, filename);

  return getData(urlStr)
    .then(data => fs.writeFile(filepath, data))
    .catch((err) => {
      console.log('.catch from downloadRemoteFile func:\n', err.message);
      return err;
    });
};

const downloadAllFiles = (urls, path, html) =>
  Promise.all(urls.map(url => downloadRemoteFile(url, path)))
    .then(() => html);

export default loadPage;

