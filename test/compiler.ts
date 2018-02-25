import path from 'path';
import webpack from 'webpack';
// import memoryfs from 'memory-fs';

export default (fixture):Promise<any> => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname, './output/'),
      filename: 'bundle.js',
      library: "loadData",
      libraryTarget: "commonjs2"
    },
    resolve: {
      extensions: ['.js', '.yaml', '.json'],
    },
    resolveLoader: {
      modules: [
        'node_modules',
      ]
    },
    module: {
      rules: [
        {
          test: /\.json$/,
          type: "javascript/dynamic",
          use: [
            { loader: path.resolve(__dirname, '../src/lib/loader.ts'), },
            { loader: "json-loader" }
          ]
        },
        {
          test: /\.yaml$/,
          type: "javascript/dynamic",
          // type: "json",
          use: [
            { loader: path.resolve(__dirname, '../src/lib/loader.ts'), },
            { loader: "json-loader" },
            { loader: "yaml-loader" }
          ]
        },
      ]
    }
  });

  // compiler.outputFileSystem = new memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);

      resolve(stats);
    });
  });
}
