import { EnvironmentPlugin } from 'webpack';
import { config } from 'dotenv';

config();

module.exports = {
  plugins: [new EnvironmentPlugin(['BASE_API_URL'])],
};
