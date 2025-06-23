export const environment = {
  production: false,
  staging: true,
  baseApiUrl: process.env['BASE_API_URL'] || '',
  clientUrl: process.env['CLIENT_URL'] || '',
};
