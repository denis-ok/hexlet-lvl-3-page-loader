import axios from 'axios';
import fs from 'mz/fs';
import debugLib from 'debug';
import Listr from 'listr';
import { getRemoteFileUrls, changeHtmlUrls, genFilename, genOutputPath, genLocalFilename } from './utils';
import buildErrorMsg from './errorBulder';

const logInfo = debugLib('page-loader:info');
const logHttp = debugLib('page-loader:http');
const logFs = debugLib('page-loader:fs');

const getData = url => axios.get(url, { responseType: 'arraybuffer' })
  .then(res => res.data);

const getHtmlData = (url) => {
  logHttp('Making http GET request to:', url);
  return getData(url);
};

const writeEmptyHtmlFile = (filepath, data) => {
  logFs('Writing empty html file:', filepath);
  return fs.writeFile(filepath, data)
    .then(() => logFs('Ok! Html file saved.'))
    .catch((err) => {
      logFs(buildErrorMsg(err));
    });
};

const writeProcessedHtmlFile = (filepath, data) => {
  logFs('Writing processed html file:', filepath);
  return fs.writeFile(filepath, data, 'utf-8')
    .then(() => logFs('Ok! Html file saved.'));
};

const makeDirForFiles = (path) => {
  logFs('Creating directory for downloading files:', path);
  return fs.mkdir(path)
    .then(() => logFs('Ok! Directory created.'));
};

const downloadRemoteFile = (urlStr, pathForFiles) => {
  const filename = genLocalFilename(urlStr);
  const filepath = genOutputPath(pathForFiles, filename);
  logHttp('Downloading file:', urlStr);
  return getData(urlStr)
    .then(data => fs.writeFile(filepath, data))
    .then(() => logFs('Ok! File has been saved:', filepath))
    .catch((err) => {
      logInfo(buildErrorMsg(err));
      return Promise.reject(err);
    });
};

const genLoadFileTaskObj = (url, path) => {
  const taskObj = {
    title: `Downloading file: ${url}`,
    task: (ctx, task) => downloadRemoteFile(url, path)
      .catch((err) => {
        task.title = `Download file Failed: ${url}`; /* eslint-disable-line */
        task.skip(err.message);
      }),
  };
  return taskObj;
};

const genTaskLoadAllFiles = (urls, path) => {
  const tasksColl = urls.map(url => genLoadFileTaskObj(url, path));
  return new Listr(tasksColl, { concurrent: true });
};

const downloadAllFiles = (urls, path, html) => {
  logHttp('Begin downloading remote files...');
  const task = genTaskLoadAllFiles(urls, path);
  return task.run()
    .then(() => html);
};

const loadPage = (inputUrl, outputPath) => {
  logInfo('Begin page-load........................');
  const htmlFilename = genFilename(inputUrl, 'html');
  const htmlFilepath = genOutputPath(outputPath, htmlFilename);
  const filesDirname = genFilename(inputUrl, 'files');
  const filesPath = genOutputPath(outputPath, filesDirname);

  logInfo('Start asyncronous work.................');
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
    .then(() => {
      const successMsg = 'Page and files has been downloaded';
      logInfo(successMsg);
      console.log(successMsg);
      console.log('Saved html to:', htmlFilepath);
      console.log('Saved files to:', filesPath);
    })
    .catch((err) => {
      logInfo(buildErrorMsg(err));
      return Promise.reject(err);
    });
};

export default loadPage;

