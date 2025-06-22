import Dotenv from 'dotenv-webpack';
import { DefinePlugin } from 'webpack';
import { resolve } from 'path';

export const plugins = [
  new DefinePlugin({
    BASE_API_URL: JSON.stringify(process.env?.['BASE_API_URL']),
  }),
  new Dotenv({
    path: resolve(__dirname, '.env'),
    systemvars: true,
    safe: true,
    allowEmptyValues: true,
  }),
];
