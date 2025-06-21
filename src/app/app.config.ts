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

import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const AppProviders = [MessageService, ConfirmationService]; // ? Can add more global service here for injector

export const appConfig: ApplicationConfig = {
  providers: [
    ...AppProviders,
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([
        retryInterceptor,
        cacheInterceptor,
        authInterceptor,
        errorInterceptor,
      ])
    ),
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
