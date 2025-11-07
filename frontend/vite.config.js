import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import eslint from 'vite-plugin-eslint';

// Resolve Node-style __dirname for this ESM config file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), eslint({ failOnWarning: false, failOnError: false })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    css: true,
    coverage: {
      provider: 'v8',
      reports: ['text', 'html', 'lcov'],
      reportOnFailure: true,
      include: ['src/**/**/*.{js,jsx}'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
