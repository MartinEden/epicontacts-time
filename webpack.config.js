const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/epicontacts.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'epicontacts.js',
    library: "epicontacts",
    publicPath: "/assets/"
  },
  devServer: {
  	contentBase: path.resolve(__dirname, './src'),
    inline: true
  },
  module: {
    loaders: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }
  ]
  }
};