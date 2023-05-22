import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    resolve: {
      alias: {
        testcontainers: null, // integration tests may sit in src without Astro panicking
        buffer: 'buffer/',
        cbor: 'cbor-web',
      },
    },
  },
});
