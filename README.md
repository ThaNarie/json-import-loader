# json-import-loader

Allows import files into a json file. Works for any kind of import, as long it's converted to a JS
object by webpack.

This module also contains a util function that works in plain node, in case you need to use the json
or yaml file outside of webpack. Keep in mind that you can use full and relative imports.

[![Travis](https://img.shields.io/travis/mediamonks/json-import-loader.svg?maxAge=2592000)](https://travis-ci.org/mediamonks/json-import-loader)
[![npm](https://img.shields.io/npm/v/json-import-loader.svg?maxAge=2592000)](https://www.npmjs.com/package/json-import-loader)
[![npm](https://img.shields.io/npm/dm/json-import-loader.svg?maxAge=2592000)](https://www.npmjs.com/package/json-import-loader)

## Installation

```sh
yarn add -D json-import-loader
```

## Usage

The `json-import-loader` can be inserted before (so at the end of the loader-chain) any other loader
that returns json (or just any string for that matter).

It just converts a `"import!<path>"` string to the result of the imported file. The imported file
will be required through webpack, so you can use any path or extension. If you import another json,
it will be processed by the `json-loader` by default. Because of this, you can nest multiple
imports.

Since all imports will be required through webpack, you can use any path shortcuts you want that
works with the webpack `resolve` config (e.g. ignore extension, different base path).

**Note:** Webpack 4 introduced Module Types, where .json files are converted to pure json instead of
javascript. This loader makes use of the 'require' feature of webpack, which doesn't work with raw
jason. So if you're using webpack 4 or higher, please add `type: "javascript/dynamic"` to your
loader config.

Please look at the `/test/_fixtures` folder for usage examples.

**Note:** When importing JS files, if you want to support the `import!` syntax there as well, you
have to use this loader for those JS files as well. Do this in the webpack config, and make sure
to only include specific paths, so it won't be active for all JS files.

**Note:** When used on an empty file, it will return an empty object.

### Inline

```js
const json = require('json-import-loader!json-loader!./file.json');
```

### Configuration (recommended)

```js
const json = require('./file.json');
```

**webpack.config.js**

```js
module.exports = {
  module: {
    loaders: [
      {
        test: /\.json$/,
        type: 'javascript/dynamic', // only for webpack 4+
        use: [
          {
            loader: 'json-import-loader',
            options: {
              processPath: path => path,
            }
          },
          { loader: 'json-loader' }
        ],
      },
    ],
  },
};
```

### Example

**foo.json**

```json
{
  "foo": "import!foo/bar.json",
  "foos": ["import!foo/foo1.json", "import!foo/foo2.json"]
}
```

### Yaml

When using the [yaml-loader](https://github.com/okonet/yaml-loader) it's also supported in/with
yaml files, you can mix and match different imports.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        // include: /regexp-pattern-for-just-data-files/,
        use: [
          {
            loader: 'json-import-loader',
            options: {
              processPath: path => path,
            }
          }
        ]
      },
      {
        test: /\.json$/,
        type: 'javascript/dynamic', // only for webpack 4+
        use: [{ loader: 'json-import-loader' }, { loader: 'json-loader' }],
      },
      {
        test: /\.yaml$/,
        type: 'javascript/dynamic', // only for webpack 4+
        use: [
          { loader: 'json-import-loader' },
          { loader: 'json-loader' },
          { loader: 'yaml-loader' },
        ],
      },
    ],
  },
};
```

**foo.yaml**

```yaml
foo: import!foo/bar.yaml
foos:
  - import!foo/foo1.json
  - import!foo/foo2.yaml
```

### Node API

If you want to use the json, js or yaml files outside of webpack, this function will resolve the
imports for you.

```js
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const { loadData } = require('json-import-loader');

// by default, json and js are supported
const jsonObj = loadData(path.resolve(__dirname, './data/foo.json'));

// additional extensions can be supported by providing resolvers for extensions
const yamlObj = loadData(path.resolve(__dirname, './data/foo.yaml'), {
  resolvers: {
    yaml: path => yaml.safeLoad(fs.readFileSync(path, 'utf8')),
  },
  // the path can be changed in this hook, in case you want to use variables in there
  processPath: path => path,
});
```

#### import js

If you import a JS file, it should either export an object or a function. When a function, it will
be called, and the result will be used.

#### resolver map

The resolver map expects the extension as the key, and a function as the value. The resolve function
will receive the path (from the import) as parameter, and should return a string or object.

#### importing without extension

When no file extension is given in the import directive (e.g. `"import!./foo"`), it will try to
resolve the file on disk with all the available extensions, starting with `json` and `js`, followed
up by the extensions passed in the resolve map. This is mainly to mimic webpack resolve logic, so
the same json files can be used with both the Webpack loader and the Node API.

## Building

In order to build json-import-loader, ensure that you have [Git](http://git-scm.com/downloads)
and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:

```sh
git clone https://github.com/mediamonks/json-import-loader.git
```

Change to the json-import-loader directory:

```sh
cd json-import-loader
```

Install dev dependencies:

```sh
yarn
```

Use one of the following main scripts:

```sh
yarn build            # build this project
yarn dev              # run compilers in watch mode, both for babel and typescript
yarn test             # run the unit tests incl coverage
yarn test:dev         # run the unit tests in watch mode
yarn lint             # run eslint and tslint on this project
yarn doc              # generate typedoc documentation
```

When installing this module, it adds a pre-commit hook, that runs lint and prettier commands
before committing, so you can be sure that everything checks out.

## Contribute

View [CONTRIBUTING.md](./CONTRIBUTING.md)

## Changelog

View [CHANGELOG.md](./CHANGELOG.md)

## Authors

View [AUTHORS.md](./AUTHORS.md)

## LICENSE

[MIT](./LICENSE) © ThaNarie
