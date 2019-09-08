import * as webpack from 'webpack';

const loaderUtils = require('loader-utils');

/**
 * Allows you to import external files into a json value.
 * Can be used for any value, in an object or array.
 */
export default function(this: webpack.loader.LoaderContext, content: string) {
  // tslint:disable no-this-assignment
  const loaderContext: webpack.loader.LoaderContext = this;
  const options = loaderUtils.getOptions(loaderContext) || {};

  const done = loaderContext.async();
  loaderContext.cacheable();

  const newContent = content.replace(/(["'])import!(.*?)\1/gi, (_, __, group) => {
    let path = loaderUtils.stringifyRequest(loaderContext, group);
    if (options.processPath && typeof options.processPath === 'function')
      path = options.processPath(path);
    return `(
  function() {
    var result = require(${path})
    if (typeof result === 'function') {
      result = result();
    }
    return result;
  }
)()`;
  });

  done(null, newContent);
}
