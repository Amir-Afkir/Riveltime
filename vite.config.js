// vite.config.js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: "/", // pour permettre un déploiement propre sur Netlify
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // backend local
        changeOrigin: true,
        secure: false,
      },
    },
  },
});