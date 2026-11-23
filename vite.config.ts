import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relativa ('./') garante funcionamento tanto em localhost quanto em qualquer subcaminho do GitHub Pages (/nome-do-repo/)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
