import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://alanmundler.github.io',
  base: '/fibramap-page',
  integrations: [tailwind()],
});
