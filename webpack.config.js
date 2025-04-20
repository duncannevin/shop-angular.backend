const path = require('path');
const glob = require('glob');

// Find all handlers under lib/*
const entries = glob.sync(
  './lib/**/handler.ts',
).reduce((acc, file) => {
  const name = path
    .dirname(file)         // e.g., ./lib/lambdas/getProducts
    .replace('./lib/', ''); // e.g., lambdas/getProducts
  acc[name] = file;
  return acc;
}, {});

module.exports = {
  target: 'node',
  mode: 'production',
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/handler.js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      services: path.resolve(__dirname, 'lib/services'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // Leave aws-sdk out of bundle (already available in Lambda)
    'aws-sdk': 'aws-sdk',
  },
};
