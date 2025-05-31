// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'sera',
      fileName: 'sera'
    },
    minify: true,
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  }
});
