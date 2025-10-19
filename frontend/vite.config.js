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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      pages: path.resolve(__dirname, 'src/pages'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      utils: path.resolve(__dirname, 'src/utils'),
      features: path.resolve(__dirname, 'src/features'),
      providers: path.resolve(__dirname, 'src/providers'),
      services: path.resolve(__dirname, 'src/services'),
    },
  },
});
