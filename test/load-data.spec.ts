import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import loadData from '../src/lib/load-data';

describe('load-data', () => {
  it('should load and merge everything', () => {
    const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, './_fixtures/merged.json'), 'utf-8').replace(/\\n/gi, '\n'));
    const actual = loadData(
      path.resolve(__dirname, './_fixtures/a.json'),
      {
        resolvers: {
          yaml: path => yaml.safeLoad(fs.readFileSync(path, 'utf8'))
        },
      },
    );
    expect(actual).to.deep.equal(expected);
  });
  it('should throw an error on unknown extensions', () => {
    const actual = () => loadData(
      path.resolve(__dirname, './_fixtures/a.json'),
    );
    expect(actual).to.throw('Extension "yaml" for path');
  });
});
