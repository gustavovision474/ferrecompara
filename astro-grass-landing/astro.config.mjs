import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// Adapters (descomenta según plataforma de deploy)
// import vercel from '@astrojs/vercel/static';
// import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'static',
  site: 'https://astrograss.com.ec',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap(),
    icon({
      include: {
        lucide: ['*'],
      },
    }),
  ],

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
