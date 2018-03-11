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

  describe('when no extension is passed', () => {
    it('should try to load existing json file', () => {
      const actual = loadData(
        path.resolve(__dirname, './_fixtures/no-extension/json/test.json'),
      );
      const expected = {
        json: {
          value: 'json',
        },
      };
      expect(actual).to.deep.equal(expected);
    });
    it('should try to load existing js file', () => {
      const actual = loadData(
        path.resolve(__dirname, './_fixtures/no-extension/js/test.json'),
      );
      const expected = {
        js: {
          value: 'js',
        },
      };
      expect(actual).to.deep.equal(expected);
    });
    it('should try to load existing yaml file when provided', () => {
      const actual = loadData(
        path.resolve(__dirname, './_fixtures/no-extension/yaml/test.json'),
        {
          resolvers: {
            yaml: path => yaml.safeLoad(fs.readFileSync(path, 'utf8'))
          },
        },
      );
      const expected = {
        yaml: {
          value: 'yaml',
        },
      };
      expect(actual).to.deep.equal(expected);
    });
  });
});
