import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import InputFeaturesFixtures from '../browser/fixtures/InputFeaturesFixtures.svelte';

describe('Input config SSR', () => {
  it(
    'renders provider settings and isolates addon controls from the adjacent FormItem and Compact',
    () => {
      const body = render(InputFeaturesFixtures).body;

      expect(body).toContain('ant-input-filled');
      expect(body).toContain('context-input');
      expect(body).toContain('autocomplete="off"');
      expect(body).toContain('Counted input');

      const addon = body.match(/<input[^>]*aria-label="Isolated input addon"[^>]*>/)?.[0];

      expect(addon).toBeDefined();
      expect(addon).not.toMatch(
        /\s(?:name|id|required|aria-invalid)=|ant-input-sm|ant-input-compact/
      );
    }
  );
});
