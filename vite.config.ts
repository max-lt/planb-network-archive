import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sitemap } from 'svelte-sitemap';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    sitemap({
      website: 'https://example.com',
      target: '.svelte-kit/output/client/sitemap.xml'
    })
  ]
});
