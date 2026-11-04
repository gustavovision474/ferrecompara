import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      angular(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 53259,
      host: '0.0.0.0',
      hmr: process.env['DISABLE_HMR'] !== 'true',
    },
    optimizeDeps: {
      include: ['@angular/compiler', '@angular/common', '@angular/forms', '@angular/router', 'motion/react'],
    },
  };
});
