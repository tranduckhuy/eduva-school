export const environment = {
  production: false,
  firebase: JSON.parse(process.env['API_URL'] as string),
};
