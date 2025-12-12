const paths = require('../scripts/paths');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: paths.assets,
    filename: 'bundle.js',
    assetModuleFilename: '[name].[hash][ext][query]',
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [`${paths.assets}/fonts/*`],
      cleanAfterEveryBuildPatterns: [`${paths.assets}/fonts/*`],
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
  ],

  performance: {
    hints: 'warning',
    maxAssetSize: 1024 * 1024 * 3,
    maxEntrypointSize: 1024 * 1024 * 3,
  },

  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
};
