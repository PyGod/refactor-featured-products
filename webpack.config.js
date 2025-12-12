const { merge } = require('webpack-merge');
const common = require('./webpack/webpack.common');
const dev = require('./webpack/webpack.dev');
const prod = require('./webpack/webpack.prod');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  return isProd ? merge(common, prod) : merge(common, dev);
};
