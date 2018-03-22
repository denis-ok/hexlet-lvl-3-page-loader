import nock from 'nock';
// import axios from 'axios';
import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import beautify from 'js-beautify';
import loadPage from '../src';

const format = (html) => {
  const options = {
    indent_size: 2,
    indent_char: ' ',
    indent_with_tabs: false,
    eol: '\n',
    end_with_newline: false,
    preserve_newlines: true,
    max_preserve_newlines: 0,
    indent_inner_html: false,
    brace_style: 'collapse',
    indent_scripts: 'normal',
    wrap_line_length: 0,
    wrap_attributes: 'auto',
  };

  return beautify.html(html, options);
};

const makeTempDir = () => {
  const tmpDir = `${os.tmpdir()}${path.sep}`;
  return fs.mkdtemp(tmpDir);
};

const readHtmlFileSync = (relPath) => {
  const filepath = path.join(__dirname, relPath);
  return fs.readFileSync(filepath, 'utf8');
};

const hexletURL = 'http://hexlet.io/courses';
const dirname = 'hexlet-io-courses_files';
const filename = 'hexlet-io-courses.html';
const jpg = 'jpeg data';
const js = 'const square = x => x * x;';
const css = 'h1 { color: black; }';

nock.disableNetConnect();

describe('requests', () => {
  const htmlBefore = readHtmlFileSync('./__fixtures__/before.html');
  const htmlAfter = readHtmlFileSync('./__fixtures__/after.html');

  beforeAll(() => {
    nock('http://hexlet.io')
      .get('/courses')
      .reply(200, htmlBefore);

    nock('http://hexlet.io')
      .get('/img/logo/big.jpg')
      .reply(200, jpg);

    nock('http://hexlet.io')
      .get('/assets/application1.js')
      .reply(200, js);

    nock('http://hexlet.io')
      .get('/default1.css')
      .reply(200, css);

    nock('http://page.com')
      .get('/img/logo/small.jpg')
      .reply(200, jpg);

    nock('http://page.com')
      .get('/assets/application2.js')
      .reply(200, js);

    nock('http://page.com')
      .get('/default2.css')
      .reply(200, css);
  });

  it('Should download html, files, modify urls in html', async () => {
    const tempDir = await makeTempDir();
    const loadedHtmlPath = path.join(tempDir, filename);
    const loadedFilesPath = path.join(tempDir, dirname);

    await loadPage(hexletURL, tempDir);

    const loadedFilesList = await fs.readdir(loadedFilesPath);
    const loadedFilesCount = loadedFilesList.length;
    const loadedHtml = await fs.readFile(loadedHtmlPath, 'utf8');

    expect(loadedFilesCount).toEqual(6);
    expect(format(loadedHtml)).toEqual(format(htmlAfter));
  });
});

