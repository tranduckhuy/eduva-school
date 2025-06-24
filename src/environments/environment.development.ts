export const environment = {
  production: false,
  firebase: JSON.parse(process.env['BASE_API_URL'] as string),
};
