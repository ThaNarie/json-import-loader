const loaderUtils = require('loader-utils');

/**
 * Allows you to import external files into a json value.
 * Can be used for any value, in an object or array.
 */
export default function(this: any, content: string) {
  // tslint:disable no-this-assignment
  const loaderContext = this;

  const done = loaderContext.async();
  loaderContext.cacheable();

  const newContent = content.replace(
    /"import!(.*?)"/gi,
    (_, group) => `(
  () => {
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
