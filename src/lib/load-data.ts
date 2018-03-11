import path from 'path';
import fs from 'fs';

export default function loadData(contentPath, options = {}) {
  return JSON.parse(getData(contentPath, options));
}

export function getData(
  contentPath: string,
  options?: {
    resolvers?: { [key: string]: (path: string) => string | object };
  },
) {
  // find all import occurrences and replace with the actual content
  return load(contentPath, options).replace(/"import!(.*?)"/gi, (_, group) =>
    // recursion is supported
    getData(path.resolve(__dirname, path.dirname(contentPath), group), options),
  );
}
export function load(contentPath, options) {
  let extension = path.extname(contentPath).slice(1);

  if (!extension) {
    const resolvedPath = resolvePath(contentPath, options);
    if (resolvedPath) {
      // tslint:disable no-parameter-reassignment
      contentPath = resolvedPath;
      extension = path.extname(contentPath).slice(1);
    }
  }

  // use normal require
  if (['json', 'js'].includes(extension)) {
    let result = require(contentPath);

    // if js export was a function, execute it and use the result
    if (typeof result === 'function') {
      result = result();
    }

    if (typeof result === 'string') {
      return result;
    }
    // convert object to json string
    return JSON.stringify(result);
  }

  // resolve using provided mapper
  if (options.resolvers && options.resolvers[extension]) {
    const result = options.resolvers[extension](contentPath);
    if (typeof result === 'string') {
      return result;
    }
    // convert object to json string
    return JSON.stringify(result);
  }

  throw new Error(
    `Extension "${extension}" for path "${contentPath}" is not supported, please configure a resolve function by setting "options.resolvers.${extension}". It will receive a path and should return the content as a string.`,
  );
}

function resolvePath(contentPath, options) {
  return ['json', 'js', ...((options.resolvers && Object.keys(options.resolvers)) || [])]
    .map(extension => `${contentPath}.${extension}`)
    .find(path => fs.existsSync(path));
}
