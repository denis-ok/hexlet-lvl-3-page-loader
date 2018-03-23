/* eslint-disable no-use-before-define, no-shadow, object-curly-newline */
import axios from 'axios';
import fs from 'mz/fs';
import debugLib from 'debug';
import { getRemoteFileUrls, changeHtmlUrls, genFilename, genOutputPath, genLocalFilename } from './utils';
import buildErrorMsg from './errorBulder';

const infoLogger = debugLib('page-loader:info');
const httpLogger = debugLib('page-loader:http');
const fsLogger = debugLib('page-loader:fs');

const log = (type, ...messages) => {
  const loggers = {
    info: infoLogger,
    http: httpLogger,
    fs: fsLogger,
  };
  return loggers[type](...messages);
};

const loadPage = (inputUrl, outputPath) => {
  log('info', 'Begin page-load........................');
  const htmlFilename = genFilename(inputUrl, 'html');
  const htmlFilepath = genOutputPath(outputPath, htmlFilename);
  const filesDirname = genFilename(inputUrl, 'files');
  const filesPath = genOutputPath(outputPath, filesDirname);

  // console.log('Save html to:', htmlFilepath);
  // console.log('Save files to:', filesPath);

  log('info', 'Start asyncronous work.................');
  return writeEmptyHtmlFile(htmlFilepath, '')
    .then(() => makeDirForFiles(filesPath))
    .then(() => getHtmlData(inputUrl))
    .then((htmlData) => {
      log('info', 'Getting required urls and process html...');
      const filesToDownload = getRemoteFileUrls(htmlData, inputUrl);
      const modifiedHtml = changeHtmlUrls(htmlData, inputUrl);
      return downloadAllFiles(filesToDownload, filesPath, modifiedHtml);
    })
    .then(modifiedHtml => writeProcessedHtmlFile(htmlFilepath, modifiedHtml))
    .then(() => {
      const successMsg = 'Page and files has been succesfully downloaded';
      log('info', successMsg);
      // console.log(successMsg);
    })
    .catch((err) => {
      log('info', buildErrorMsg(err));
      return Promise.reject(err);
    });
};

const getData = url => axios.get(url, { responseType: 'arraybuffer' })
  .then(res => res.data);

const getHtmlData = (url) => {
  log('http', 'Making http GET request to:', url);
  return getData(url)
    .catch(err => Promise.reject(err));
};

const writeFile = (filepath, data) => fs.writeFile(filepath, data);

const writeEmptyHtmlFile = (filepath, data) => {
  log('fs', 'Writing empty html file:', filepath);
  return writeFile(filepath, data)
    .then(() => log('fs', 'Ok! Html file saved.'))
    .catch((err) => {
      log('fs', buildErrorMsg(err));
      return Promise.reject(err);
    });
};

const writeProcessedHtmlFile = (filepath, data) => {
  log('fs', 'Writing processed html file:', filepath);
  return writeFile(filepath, data)
    .then(() => log('fs', 'Ok! Html file saved.'))
    .catch(err => Promise.reject(err));
};

const makeDirForFiles = (path) => {
  log('fs', 'Creating directory for downloading files:', path);
  return fs.mkdir(path)
    .then(() => log('fs', 'Ok! Directory created.'))
    .catch(err => Promise.reject(err));
};

const downloadRemoteFile = (urlStr, pathForFiles) => {
  const filename = genLocalFilename(urlStr);
  const filepath = genOutputPath(pathForFiles, filename);
  log('http', 'Downloading file:', urlStr);
  return getData(urlStr)
    .then(data => writeFile(filepath, data))
    .then(() => log('fs', 'Ok! File has been saved:', filepath))
    .catch((err) => {
      log('info', buildErrorMsg(err));
    });
};

const downloadAllFiles = (urls, path, html) => {
  log('http', 'Begin downloading remote files...');
  return Promise.all(urls.map(url => downloadRemoteFile(url, path)))
    .then(() => html);
};

export default loadPage;

