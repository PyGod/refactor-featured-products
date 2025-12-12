const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const paths = require('../scripts/paths');

module.exports = {
  entry: {
    bundle: paths.src + '/js/index.js',
  },

  module: {
    rules: [
      {
        test: [/\.s[ac]ss$/, /\.css$/],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true, url: true },
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
              sourceMap: true,
            },
          },
        ],
      },

      {
        test: /\.(woff|woff2)$/i,
        type: 'asset/resource',
        include: paths.fonts,
        generator: {
          filename: 'fonts/[name][hash][ext]',
        },
      },

      {
        test: /\.(ico|png|svg)$/i,
        include: paths.public,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),

    new CopyPlugin({
      patterns: [
        {
          from: paths.public + '/favicon.ico',
          to: paths.assets + '/favicon.ico',
          globOptions: { dot: true },
        },
      ],
    }),
    new Dotenv(),
  ],
};
