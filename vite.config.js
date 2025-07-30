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
        id: '/', // ✅ requis pour PWABuilder
        name: 'Riveltime',
        short_name: 'Riveltime',
        description: 'Livraison locale rapide et responsable',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ed354f',
        background_color: '#f3f4f6',
        orientation: 'portrait',
        lang: 'fr',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512-any.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512-maskable.png',
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
        screenshots: [ // ✅ pour PWABuilder + Store publication
          {
            src: 'screenshot1.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot2.jpeg',
            sizes: '709x1536',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'screenshot3.jpeg',
            sizes: '709x1536',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'screenshot4.jpeg',
            sizes: '709x1536',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'screenshot5.jpeg',
            sizes: '709x1536',
            type: 'image/png',
            form_factor: 'narrow'
          },
        ],
        launch_handler: { // ✅ conseillé pour apparence native
          client_mode: 'auto'
        },
        categories: ['shopping', 'utilities', 'food'], // ✅ conseillé
        display_override: ['standalone', 'browser'], // ✅ conseil Chrome
        edge_side_panel: {
          preferred: true // ✅ pour side panel Windows/Edge
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