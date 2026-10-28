import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

// Build setup added so the kb renders outside the support repo: .svx pages, runbook layout, #lib imports.
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook } })],
  kit: {
    adapter: adapter({ pages: process.env.OUT_DIR ?? 'build', assets: process.env.OUT_DIR ?? 'build', strict: false }),
    alias: { '#lib': 'src/lib' },
    // GitHub Pages serves the kb under /<repo>; BASE_PATH=/mega-s01e03 for that build.
    paths: { base: process.env.BASE_PATH ?? '' },
    prerender: { entries: ['*'], handleHttpError: 'warn' },
  },
};
