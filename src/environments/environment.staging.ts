export const environment = {
  production: false,
  staging: true,
  baseApiUrl: process.env['BASE_API_URL'] || '',
  clientUrl: process.env['CLIENT_URL'] || '',
  supabase: {
    url: process.env['SUPABASE_URL'] || '',
    key: process.env['SUPABASE_KEY'] || '',
  },
};
