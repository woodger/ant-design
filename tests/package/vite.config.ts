import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte({ configFile: false })],
  test: {
    expect: { requireAssertions: true },
    environment: 'node',
    include: ['tests/package/**/*.test.ts']
  }
});
