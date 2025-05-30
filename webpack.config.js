const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Find all handlers under lib/*
const entries = glob.sync(
  './lib/**/*handler.ts',
).reduce((acc, file) => {
  const name = path
    .relative('./lib', file) // Preserve the relative path under lib
    .replace(/\.ts$/, '');   // Remove the .ts extension
  acc[name] = file;
  return acc;
}, {});

module.exports = {
  target: 'node',
  mode: 'production',
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js', // Use only the name without [path]
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      services: path.resolve(__dirname, 'lib/common/services'),
      utils: path.resolve(__dirname, 'lib/common/utils'),
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
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ContextReplacementPlugin(
      /aws-cdk-lib\/custom-resources\/lib\/helpers-internal/,
      path.resolve(__dirname, './src') // Adjust the path as needed
    ),
  ],
};