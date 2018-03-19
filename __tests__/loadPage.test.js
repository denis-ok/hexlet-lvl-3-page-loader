import nock from 'nock';
// import axios from 'axios';
import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import loadPage from '../src';

const makeTempDir = () => {
  const tmpDir = `${os.tmpdir()}${path.sep}`;
  return fs.mkdtemp(tmpDir)
    .catch(err => console.log(err.message));
};

nock.disableNetConnect();

const hexletURL = 'http://hexlet.io/courses';
const hexletPageData = 'Hexlet courses list';
const filename = 'hexlet-io-courses.html';

nock('http://hexlet.io')
  .get('/courses')
  .reply(200, hexletPageData);

describe('requests', () => {
  // beforeAll(() => {
  // });

  it('Should download body and save data to html file', async () => {
    const tempDir = await makeTempDir();
    const filepath = path.join(tempDir, filename);
    await loadPage(hexletURL, tempDir);

    const loadedData = await fs.readFile(filepath, 'utf-8');
    expect(loadedData).toEqual(hexletPageData);
  });
});
