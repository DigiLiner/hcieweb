import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web';

  return {
    // Set base for GitHub Pages if needed, or leave as '/' for root domains
    base: process.env.VITE_BASE_URL || '/',
    
    // Single-page app — entry is index.html at root
    root: '.',
    publicDir: 'public',

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

    resolve: {
      alias: {
        '@core': resolve(__dirname, 'src/core'),
        '@canvas': resolve(__dirname, 'src/canvas'),
        '@tools': resolve(__dirname, 'src/tools'),
        '@ui': resolve(__dirname, 'src/ui'),
        '@io': resolve(__dirname, 'src/io'),
      },
    },

    build: {
      outDir: isWeb ? 'dist-web' : 'tauri-dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },

    server: {
      port: 1420,
      strictPort: true,
      // Ensure 127.0.0.1 is used correctly
      host: '127.0.0.1', 
      open: false,
    },
  };
});
