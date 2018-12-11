import * as webpack from 'webpack';

const loaderUtils = require('loader-utils');

/**
 * Allows you to import external files into a json value.
 * Can be used for any value, in an object or array.
 */
export default function(this: webpack.loader.LoaderContext, content: string) {
  // tslint:disable no-this-assignment
  const loaderContext: webpack.loader.LoaderContext = this;

  const done = loaderContext.async();
  loaderContext.cacheable();

  const newContent = content.replace(
    /(["'])import!(.*?)\1/gi,
    (_, __, group) => `(
  function() {
    var result = require(${loaderUtils.stringifyRequest(loaderContext, group)})
    if (typeof result === 'function') {
      result = result();
    }
    return result;
  }
)()`,
  );

  done(null, newContent);
}
