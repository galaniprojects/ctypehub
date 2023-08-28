import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), svelte()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
