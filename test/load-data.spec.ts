import { expect } from 'chai';
import fs from 'fs';
import sysPath from 'path';
import yaml from 'js-yaml';
import loadData from '../src/lib/load-data';

describe('load-data', () => {
  it('should load and merge everything', () => {
    const expected = JSON.parse(
      fs
        .readFileSync(sysPath.resolve(__dirname, './_fixtures/merged.json'), 'utf-8')
        .replace(/\\n/gi, '\n'),
    );
    const actual = loadData(sysPath.resolve(__dirname, './_fixtures/a.json'), {
      resolvers: {
        yaml: path => yaml.safeLoad(fs.readFileSync(path, 'utf8')),
      },
    });
    expect(actual).to.deep.equal(expected);
  });
  it('should throw an error on unknown extensions', () => {
    const actual = () => loadData(sysPath.resolve(__dirname, './_fixtures/a.json'));
    expect(actual).to.throw('Extension "yaml" for path');
  });

  it('should not fail on empty json file', () => {
    const actual = loadData(sysPath.resolve(__dirname, './_fixtures/empty.json'));
    expect(actual).to.deep.equal({});
  });
  it('should not fail on empty yaml file', () => {
    const actual = loadData(sysPath.resolve(__dirname, './_fixtures/empty.yaml'), {
      resolvers: {
        yaml: path => yaml.safeLoad(fs.readFileSync(path, 'utf8')),
      },
    });
    expect(actual).to.deep.equal({});
  });

  describe('when no extension is passed', () => {
    it('should try to load existing json file', () => {
      const actual = loadData(
        sysPath.resolve(__dirname, './_fixtures/no-extension/json/test.json'),
      );
      const expected = {
        json: {
          value: 'json',
        },
      };
      expect(actual).to.deep.equal(expected);
    });
    it('should try to load existing js file', () => {
      const actual = loadData(sysPath.resolve(__dirname, './_fixtures/no-extension/js/test.json'));
      const expected = {
        js: {
          value: 'js',
        },
      };
      expect(actual).to.deep.equal(expected);
    });
    it('should try to load existing yaml file when provided', () => {
      const actual = loadData(
        sysPath.resolve(__dirname, './_fixtures/no-extension/yaml/test.json'),
        {
          resolvers: {
            yaml: path => yaml.safeLoad(fs.readFileSync(path, 'utf8')),
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

  describe('when import path has variable', () => {
    it('should resolve the variable before loading', () => {
      const replaceVariables = {
        varC: 'c',
        foo: 'bar',
      };

      const actual = loadData(sysPath.resolve(__dirname, './_fixtures/variable.json'), {
        resolvers: {
          yaml: path => yaml.safeLoad(fs.readFileSync(path, 'utf8')),
        },
        processPath: path =>
          Object.keys(replaceVariables).reduce(
            (data, varName) =>
              // replace ${foo} occurrences in the data to be rendered.
              data.replace(new RegExp(`\\$\{${varName}}`, 'g'), () => replaceVariables[varName]),
            path,
          ),
      });
      const expected = JSON.parse(
        fs
          .readFileSync(sysPath.resolve(__dirname, './_fixtures/merged.json'), 'utf-8')
          .replace(/\\n/gi, '\n'),
      );
      expect(actual).to.deep.equal(expected);
    });
  });
});
