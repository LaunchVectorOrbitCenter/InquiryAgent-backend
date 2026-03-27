/* global process */

const CopyPlugin = require('copy-webpack-plugin');
const { env } = require('process');

let source = '';
let dest = process.cwd() + `/build/environments/environment.json`;
switch (process.env.NODE_ENV) {
  case 'staging':
    source = process.cwd() + `/environments/environment.${env.NODE_ENV}.json`;
    break;
  case 'production':
    source = process.cwd() + `/environments/environment.${env.NODE_ENV}.json`;
    break;
  case 'uat':
    source = process.cwd() + `/environments/environment.${env.NODE_ENV}.json`;
    break;
  case 'local':
    source = process.cwd() + `/environments/environment.json`;
    break;
  default:
    source = process.cwd() + `/environments/environment.json`;
    break;
}
module.exports = {
  entry: source,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.json$/i,
        loader: 'file-loader',
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: source, to: dest }],
    }),
  ],
};