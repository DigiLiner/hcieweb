import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@hcie/core': resolve(__dirname, '../hcie-core/src/index.ts'),
      '@hcie/shared': resolve(__dirname, '../hcie-shared/src/index.ts'),
      '@hcie/tools': resolve(__dirname, '../hcie-tools/src/index.ts'),
      '@hcie/io': resolve(__dirname, '../hcie-io/src/index.ts'),
      '@hcie/canvas-ui': resolve(__dirname, '../hcie-canvas-ui/src/index.ts'),
      '@hcie/ui-components': resolve(__dirname, '../hcie-ui-components/src/index.ts'),
    }
  },
  build: {
    outDir: 'dist-static',
    lib: {
      entry: resolve(__dirname, 'apps/web/src/main.ts'),
      name: 'hcie',
      formats: ['iife'],
      fileName: () => 'main.bundle.js'
    },
    rollupOptions: {
      external: [/^@tauri-apps\/api/],
      output: {
        globals: {
          '@tauri-apps/api': 'Tauri'
        }
      }
    }
  }
});
