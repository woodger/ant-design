import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { InputPassword } from 'antd-svelte';
import InputPasswordFixtures from '../browser/fixtures/InputPasswordFixtures.svelte';

describe('InputPassword public package SSR', () => {
  it('exposes a standalone password component with controlled visibility', () => {
    const body = render(InputPassword, {
      props: { value: 'visible', visibilityToggle: { visible: true } }
    }).body;

    expect(body).toContain('type="text"');
    expect(body).toContain('aria-pressed="true"');
  });

  it(
    'inherits Input config while replacing nested password config and merging locale fields',
    () => {
      const body = render(InputPasswordFixtures).body;

      expect(body).toContain('ant-input-underlined');
      expect(body).toContain('ant-input-borderless');
      expect(body).toContain('password-context');
      expect(body).toContain('base-input');
      expect(body).toContain('autocomplete="off"');
      expect(body).toContain('aria-label="Reveal"');
      expect(body).toContain('aria-label="Показать"');
    }
  );
});
