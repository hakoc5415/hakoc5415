import { defineConfig } from 'vite';

// base './' — hem web'de alt dizinde hem Capacitor'ün file:// ortamında çalışır
export default defineConfig({
  base: './',
  build: {
    target: 'es2019',
    assetsInlineLimit: 0
  }
});
