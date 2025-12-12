const paths = require('../scripts/paths');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: paths.assets,
    filename: 'bundle.js',
  },
  optimization: {
    minimize: false,
  },
};
