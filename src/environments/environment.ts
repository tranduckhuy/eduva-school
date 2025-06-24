export const environment = {
  production: true,
  firebase: JSON.parse(process.env['BASE_API_URL'] as string),
};
