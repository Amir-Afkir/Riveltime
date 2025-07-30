import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: "/", // Déploiement à la racine du domaine
  plugins: [
    react(),
    VitePWA({
      srcDir: 'src',
      filename: 'sw.js',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png'
      ],
      manifest: {
        name: 'Riveltime',
        short_name: 'Riveltime',
        description: 'Livraison locale rapide et responsable',
        start_url: '/',
        scope: '/',
        id: '/',
        lang: 'fr',
        dir: 'auto',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay'],
        orientation: 'portrait',
        theme_color: '#ed354f',
        background_color: '#f3f4f6',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: "screenshot1.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          },
          {
            src: "screenshot2.jpeg",
            sizes: "709x1536",
            type: "image/jpeg",
            form_factor: "narrow"
          },
          {
            src: "screenshot3.jpeg",
            sizes: "709x1536",
            type: "image/jpeg",
            form_factor: "narrow"
          },
          {
            src: "screenshot4.jpeg",
            sizes: "709x1536",
            type: "image/jpeg",
            form_factor: "narrow"
          },
          {
            src: "screenshot5.jpeg",
            sizes: "709x1536",
            type: "image/jpeg",
            form_factor: "narrow"
          }
        ],
        launch_handler: {
          client_mode: 'auto'
        },
        categories: [
          'food',
          'navigation',
          'productivity',
          'shopping',
          'utilities'
        ],
        edge_side_panel: {
          preferred: true
        }
      },
      cleanupOutdatedCaches: true,
      enableWorkboxModulesLogs: false,
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});