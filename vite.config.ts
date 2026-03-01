
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Almoutamayiz',
        short_name: 'Almoutamayiz',
        description: 'رفيقك الذكي للنجاح في البكالوريا',
        theme_color: '#ffc633',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'https://i.ibb.co/XfH1FghM/IMG-20260111-172954.jpg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.ibb.co/XfH1FghM/IMG-20260111-172954.jpg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    target: 'esnext'
  },
  server: {
    port: 3000
  }
});
