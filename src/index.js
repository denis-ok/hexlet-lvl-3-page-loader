/* eslint-disable no-use-before-define, no-shadow */
import axios from 'axios';
import fs from 'mz/fs';
import debug from 'debug';
import { getRemoteFileUrls, changeHtmlUrls, genFilename, genOutputPath, genLocalFilename } from './utils';

const logInfo = debug('page-loader:info');
const logError = debug('page-loader:errors');
const showLogErr = (errObj, ...messages) => logError(errObj.message, ...messages);

const loadPage = (inputUrl, outputPath) => {
  logInfo('Start page-load........................');
  const htmlFilename = genFilename(inputUrl, 'html');
  const htmlFilepath = genOutputPath(outputPath, htmlFilename);
  const filesDirname = genFilename(inputUrl, 'files');
  const filesPath = genOutputPath(outputPath, filesDirname);

  // console.log('save .html to:', htmlFilepath);
  // console.log('save files to:', filesPath);
  logInfo('Begin asyncronous work...');

  return writeEmptyHtmlFile(htmlFilepath, '')
    .then(() => makeDirForFiles(filesPath))
    .then(() => getHtmlData(inputUrl))
    .then((htmlData) => {
      logInfo('Getting required urls and process html...');
      const filesToDownload = getRemoteFileUrls(htmlData, inputUrl);
      const modifiedHtml = changeHtmlUrls(htmlData, inputUrl);
      return downloadAllFiles(filesToDownload, filesPath, modifiedHtml);
    })
    .then(modifiedHtml => writeProcessedHtmlFile(htmlFilepath, modifiedHtml))
    .then(() => logInfo('Done! Page and files has been succesfully downloaded'))

    .catch((err) => {
      showLogErr(err);
      // console.log('.catch from loadPage func:\n', err.message);
      return Promise.reject(err);
    });
};

const getData = url => axios.get(url, { responseType: 'arraybuffer' })
  .then(res => res.data);

const getHtmlData = (url) => {
  logInfo('Making GET request to:', url);
  return getData(url)
    .catch((err) => {
      showLogErr(err);
      // console.log('.catch from getHtmlData func:\n', err.message);
      return Promise.reject(err);
    });
};

const writeFile = (filepath, data) => fs.writeFile(filepath, data);

const writeEmptyHtmlFile = (filepath, data) => {
  logInfo('Creating empty html file:', filepath);
  return writeFile(filepath, data)
    .catch((err) => {
      showLogErr(err);
      // console.log('.catch from writeEmptyHtmlFile func:\n', err.message);
      return Promise.reject(err);
    });
};

const writeProcessedHtmlFile = (filepath, data) => {
  logInfo('Writing processed html file:', filepath);
  return writeFile(filepath, data)
    // .then(() => console.log('Processed html saved to:', filepath))
    .then(() => logInfo('Html file saved!'))
    .catch((err) => {
      showLogErr(err);
      // console.log('.catch from writeProcessedHtmlFile func:\n', err.message);
      return Promise.reject(err);
    });
};

const makeDirForFiles = (path) => {
  logInfo('Creating dir for downloading files:', path);
  return fs.mkdir(path)
    .catch((err) => {
      showLogErr(err);
      // console.log('.catch from makeDirForFiles func:\n', err.message);
      return Promise.reject(err);
    });
};

const downloadRemoteFile = (urlStr, pathForFiles) => {
  const filename = genLocalFilename(urlStr);
  const filepath = genOutputPath(pathForFiles, filename);
  logInfo('Downloading file:', urlStr);
  return getData(urlStr)
    .then(data => writeFile(filepath, data))
    .catch((err) => {
      showLogErr(err);
      // console.log('.catch from downloadRemoteFile func:\n', err.message);
      return err;
    });
};

const downloadAllFiles = (urls, path, html) => {
  logInfo('Begin downloading remote files...');
  return Promise.all(urls.map(url => downloadRemoteFile(url, path)))
    .then(() => html);
};

export default loadPage;

