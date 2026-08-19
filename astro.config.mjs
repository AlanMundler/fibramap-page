import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://alanmundler.github.io',
  base: '/fibramap-page',
  output: 'hybrid',
  integrations: [react(), tailwind()],
  adapter: vercel(),
});
