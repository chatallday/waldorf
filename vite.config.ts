import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('motion') || id.includes('react') || id.includes('react-dom') || id.includes('react-hot-toast')) {
                return 'vendor';
              }
              if (id.includes('lucide-react')) {
                return 'icons';
              }
              return 'vendor';
            }
            if (id.includes('/src/data/')) {
              return 'data';
            }
            if (id.includes('/src/services/')) {
              return 'services';
            }
          },
        },
      },
    },
    // GEMINI_API_KEY is intentionally NOT defined here - it stays server-side
    // Client code should call /api/gemini proxy instead of using the key directly
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    appType: 'spa',
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Set dev server port to 3005 for consistent access
      port: 3005,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/teable': {
          target: 'https://app.teable.io/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/teable/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.TEABLE_API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.TEABLE_API_KEY}`);
              }
            });
          }
        }
      }
    },
  };
});
