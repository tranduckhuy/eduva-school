export const environment = {
  production: true,
  staging: false,
  baseApiUrl: process.env['BASE_API_URL'] || '',
  clientUrl: process.env['CLIENT_URL'] || '',
};
