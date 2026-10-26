import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('./fixtures', import.meta.url)),
  plugins: [svelte({ configFile: false })],
  resolve: { alias: { $lib: fileURLToPath(new URL('../src/lib', import.meta.url)) } },
  server: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] }
  }
});
