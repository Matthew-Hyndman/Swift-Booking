/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { keycloakify } from 'keycloakify/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2022'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    angular(),
    keycloakify({
      accountThemeImplementation: 'none',
      themeName: 'swift-booking-theme',
      keycloakifyBuildDirPath: '../../dist/keycloak-theme',
      keycloakVersionTargets: {
        "22-to-25": false,
        "all-other-versions": "swift-booking-theme.jar",
      },
    }),
  ],
}));
