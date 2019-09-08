import { expect } from 'chai';
import fs from "fs";
import path from "path";
import Memoryfs from 'memory-fs';
import requireFromString from 'require-from-string';
import compiler from './compiler';

function getOutput(stats) {
  if (stats.toJson().errors.length) {
    console.error(stats.toJson().errors);
  }

  return stats.toJson().modules[0].source;
}

describe('loader', () => {
  it('should load and merge everything', async () => {
    const outputFs = new Memoryfs();
    const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, './_fixtures/merged.json'), 'utf-8').replace(/\\n/gi, '\n'));
    const stats = await compiler(outputFs, '_fixtures/a.json');
    getOutput(stats);

    const fileContent = outputFs
      .readFileSync(path.resolve(__dirname, './output/bundle.js'))
      .toString();
    const actual = requireFromString(fileContent);

    // console.log('actual', actual);

    expect(actual).to.deep.equal(expected);
  }).timeout(10000);
  it('should load and merge everything with variables', async () => {
    const replaceVariables = {
      varC: 'c',
      foo: 'bar',
    };

    const outputFs = new Memoryfs();
    const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, './_fixtures/merged.json'), 'utf-8').replace(/\\n/gi, '\n'));
    const stats = await compiler(outputFs, '_fixtures/variable.json', {
      processPath: path =>
        Object.keys(replaceVariables).reduce(
          (data, varName) =>
            // replace ${foo} occurrences in the data to be rendered.
            data.replace(new RegExp(`\\$\{${varName}}`, 'g'), () => replaceVariables[varName]),
          path,
        ),
    });
    getOutput(stats);

    const fileContent = outputFs
      .readFileSync(path.resolve(__dirname, './output/bundle.js'))
      .toString();
    const actual = requireFromString(fileContent);

    // console.log('actual', actual);

    expect(actual).to.deep.equal(expected);
  }).timeout(10000);
});
