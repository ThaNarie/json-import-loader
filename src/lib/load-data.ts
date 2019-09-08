import sysPath from 'path';
import fs from 'fs';

type DataOptions = {
  resolvers?: { [key: string]: (path: string) => string | object };
  processPath?: (path: string) => string;
};

function resolvePath(contentPath, options) {
  return ['json', 'js', ...((options.resolvers && Object.keys(options.resolvers)) || [])]
    .map(extension => `${contentPath}.${extension}`)
    .find(path => fs.existsSync(path));
}

export function load(contentPath, options) {
  let extension = sysPath.extname(contentPath).slice(1);

  if (!extension) {
    const resolvedPath = resolvePath(contentPath, options);
    if (resolvedPath) {
      // tslint:disable no-parameter-reassignment
      contentPath = resolvedPath;
      extension = sysPath.extname(contentPath).slice(1);
    }
  }

  if (extension === 'json') {
    return fs.readFileSync(contentPath, 'utf8');
  }

  // use normal require
  if (extension === 'js') {
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
    return JSON.stringify(result) || '';
  }

  throw new Error(
    `Extension "${extension}" for path "${contentPath}" is not supported, please configure a resolve function by setting "options.resolvers.${extension}". It will receive a path and should return the content as a string.`,
  );
}

export function getData(contentPath: string, options?: DataOptions) {
  // find all import occurrences and replace with the actual content
  return load(
    options.processPath && typeof options.processPath === 'function'
      ? options.processPath(contentPath)
      : contentPath,
    options,
  ).replace(/"import!(.*?)"/gi, (_, group) =>
    // recursion is supported
    getData(sysPath.resolve(__dirname, sysPath.dirname(contentPath), group), options),
  );
}

export default function loadData(contentPath, options = {}) {
  const data = getData(contentPath, options);
  return data ? JSON.parse(data) : {};
}
