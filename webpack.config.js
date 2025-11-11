const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');

require('dotenv').config();

const MODE = process.env.NODE_ENV;

module.exports = {
  mode: MODE ?? 'development',
  target: 'web',
  entry: {
    bundle: path.resolve(__dirname, './src/js/featured-products.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dawn/assets'),
    filename: 'js/bundle.js',
    clean: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: [/\.sass$/i, /\.css$/i],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true },
          },
          {
            loader: 'sass-loader',
            options: { implementation: require('sass'), sourceMap: true },
          },
          {
            loader: 'postcss-loader',
            options: { postcssOptions: { plugins: ['autoprefixer'] } },
          },
        ],
      },
      {
        test: [/\.(png|jpe?g|gif|svg|ico|woff2?|ttf)$/i],
        type: 'asset/resource',
        generator: {
          filename: '[path][name][ext]',
        },
      },
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
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
      new ImageMinimizerPlugin({
        minimizer: { implementation: ImageMinimizerPlugin.imageminMinify },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/main.css',
    }),
    new Dotenv(),
  ],
};
