const ExtractTextPlugin = require('extract-text-webpack-plugin');

const autoprefixer = require('autoprefixer');

module.exports = {
  stats: { colors: true },
  devtool: 'inline-source-map',
  entry: ['babel-polyfill', './src'],
  output: {
    path: 'build',
    publicPath: 'build/',
    filename: 'bundle.js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
    },
    {
      test: /\.scss/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader!postcss-loader'),
    },
      // You could also use other loaders the same way. I. e. the autoprefixer-loader
    ],
  },
  postcss: [autoprefixer({ browsers: ['last 2 versions'] })],
  plugins: [
    new ExtractTextPlugin('bundle.css'),
  ],

};
