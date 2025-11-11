const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');

require('dotenv').config();

const MODE = process.env.NODE_ENV || 'development';
const isProd = MODE === 'production';

module.exports = {
  mode: MODE,
  target: 'web',
  entry: {
    main: path.resolve(__dirname, './src/js/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dawn/assets'),
    filename: 'js/[name].[contenthash].js',
    clean: true,
  },
  devtool: isProd ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: !isProd },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: { plugins: ['autoprefixer'] },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: { indentedSyntax: true },
              sourceMap: !isProd,
            },
          },
        ],
      },
      {
        test: /\.(?:png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: { filename: 'images/[name][ext]' },
      },
      {
        test: /\.js$/,
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
    minimize: isProd,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({ parallel: true }),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: { overrides: { removeViewBox: false } },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: path.resolve(__dirname, 'dawn/assets'),
          noErrorOnMissing: true,
        },
      ],
    }),
    new Dotenv(),
  ],
  resolve: {
    extensions: ['.js', '.sass'],
  },
};
