import { expect } from 'chai';
import fs from "fs";
import path from "path";
import compiler from './compiler';

function getOutput(stats) {
  if (stats.toJson().errors.length) {
    console.error(stats.toJson().errors);
  }

  return stats.toJson().modules[0].source;
}

describe('loader', () => {
  it('should load and merge everything', async () => {
    const expected = JSON.parse(fs.readFileSync(path.resolve(__dirname, './_fixtures/merged.json'), 'utf-8').replace(/\\n/gi, '\n'));
    const stats = await compiler('_fixtures/a.json');
    getOutput(stats);

    const actual = require('./output/bundle.js');
    // console.log('actual', actual);

    expect(actual).to.deep.equal(expected);
  });
});
