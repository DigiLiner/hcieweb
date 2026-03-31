import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web';

  return {
    // Relative base path is the most portable for varied deployment scenarios
    base: process.env.VITE_BASE_URL || './',
    
    // Single-page app — entry is index.html at root
    root: '.',
    publicDir: 'public',

    resolve: {
      alias: {
        '@tauri-apps/api': resolve(__dirname, 'node_modules/@tauri-apps/api'),
        '@hcie/core': resolve(__dirname, '../hcie-core/src/index.ts'),
        '@hcie/shared': resolve(__dirname, '../hcie-shared/src/index.ts'),
        '@hcie/tools': resolve(__dirname, '../hcie-tools/src/index.ts'),
        '@hcie/io': resolve(__dirname, '../hcie-io/src/index.ts'),
        '@hcie/canvas-ui': resolve(__dirname, '../hcie-canvas-ui/src/index.ts'),
        '@hcie/ui-components': resolve(__dirname, '../hcie-ui-components/src/index.ts'),
        'lzfjs': resolve(__dirname, 'node_modules/lzfjs'),
      }
    },

    plugins: [
      {
        name: 'fix-mime-types',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url) {
              const urlPath = req.url.split('?')[0];
              if (urlPath.endsWith('.ts')) {
                 // Force correct MIME type for TS files to prevent video/mp2t errors on Linux
                 res.setHeader('Content-Type', 'application/javascript');
              }
            }
            next();
          });
        }
      }
    ],


    build: {
      outDir: isWeb ? 'dist-web' : 'tauri-dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: isWeb ? {
            // Ensure a stable filename for static loading support
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name][extname]',
        } : {},
        external: [/^@tauri-apps\/api/],
      },
    },

    optimizeDeps: {
      exclude: ['@tauri-apps/api']
    },

    server: {
      port: 1420,
      strictPort: true,
      // Ensure 127.0.0.1 is used correctly
      host: '127.0.0.1', 
      open: false,
      fs: {
        // Allow serving files from sibling projects in the monorepo
        allow: ['..']
      }
    },
  };
});
