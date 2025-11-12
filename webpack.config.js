const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
require('dotenv').config();

const MODE = process.env.NODE_ENV || 'development';

module.exports = {
  mode: MODE,
  target: 'web',

  entry: {
    bundle: path.resolve(__dirname, './src/js/index.js'),
  },

  output: {
    path: path.resolve(__dirname, 'dawn/assets'),
    filename: 'bundle.js',

    // 🚫 Больше не очищаем папку assets полностью
    clean: {
      keep: (assetPath) => {
        // сохраняем всё, что в fonts и images
        return assetPath.includes('fonts/') || assetPath.includes('images/');
      },
    },
  },

  devtool: 'source-map',

  module: {
    rules: [
      // SASS / CSS
      {
        test: [/\.s[ac]ss$/i, /\.css$/i],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              url: {
                filter: (url) => {
                  // 🚫 не обрабатываем пути к уже готовым ассетам
                  if (
                    url.includes('assets/fonts') ||
                    url.includes('assets/images')
                  ) {
                    return false;
                  }
                  return true;
                },
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: { plugins: ['autoprefixer'] },
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: { implementation: require('sass'), sourceMap: true },
          },
        ],
      },

      // JS через Babel
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
    new Dotenv(),
  ],
};
