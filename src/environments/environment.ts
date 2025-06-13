export const environment = {
  production: true,
  firebase: JSON.parse(process.env['API_URL'] as string),
};
