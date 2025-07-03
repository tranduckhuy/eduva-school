/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import swc from 'unplugin-swc';
import { swcAngularUnpluginOptions } from '@jscutlery/swc-angular-preset';

export default defineConfig({
  plugins: [angular(), swc.vite(swcAngularUnpluginOptions())],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
  },
});
