import { HttpContextToken } from '@angular/common/http';

export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);
export const BYPASS_AUTH_ERROR = new HttpContextToken<boolean>(() => false);
export const SHOW_LOADING = new HttpContextToken<boolean>(() => true);
export const LOADING_KEY = new HttpContextToken<string>(() => 'default');
