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
      include: [
        // Remove everything and keep only the src folder.
        // For now, until merged to dev, we limit to specific
        // folders to avoid incomplete coverage reports.
        'src/hooks/**/*.{js,jsx}',
        'src/utils/**/*.{js,jsx}',
        'src/services/**/*.{js,jsx}',
        'src/providers/**/*.{js,jsx}',
        'src/store/**/*.{js,jsx}',
        // 'src/**/**/*.{js,jsx}',
      ],
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
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
