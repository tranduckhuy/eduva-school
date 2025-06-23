import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';

import { MyPreset } from './my-preset';

import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const AppProviders = [MessageService, ConfirmationService]; // ? Can add more global service here for injector
const httpInterceptors = withInterceptors([
  loggingInterceptor,
  authInterceptor,
  cacheInterceptor,
  loadingInterceptor,
  retryInterceptor,
  errorInterceptor,
]);

export const appConfig: ApplicationConfig = {
  providers: [
    ...AppProviders,
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient(httpInterceptors),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      })
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
    }),
  ],
};
