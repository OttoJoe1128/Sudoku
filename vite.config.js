import { webcrypto } from 'node:crypto';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
if (parseInt(process.versions.node.split('.')[0], 10) < 19) {
  const require = createRequire(import.meta.url);
  const workerThreads = require('worker_threads');
  const OriginalWorker = workerThreads.Worker;
  if (!OriginalWorker.__webcryptoPatched) {
    class PatchedWorker extends OriginalWorker {
      constructor(filename, options = {}) {
        const execArgv = options.execArgv ? [...options.execArgv] : [...process.execArgv];
        if (!execArgv.includes('--experimental-global-webcrypto')) {
          execArgv.push('--experimental-global-webcrypto');
        }
        super(filename, { ...options, execArgv });
      }
    }
    PatchedWorker.__webcryptoPatched = true;
    workerThreads.Worker = PatchedWorker;
  }
}

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules')) {
            return 'vendor-deps';
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'logo.png'],
      manifest: {
        id: '/',
        name: 'SudokuMap',
        short_name: 'SudokuMap',
        description: 'Klasik ve modern Sudoku progression oyunu',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tailwind-cdn-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
});
