import { render } from 'svelte/server';
import { describe, it, expect, vi } from 'vitest';
import { Image } from 'antd-svelte';
import ImageFixtures from '../browser/fixtures/ImageFixtures.svelte';

describe('Image SSR', () => {
  it(
    'renders a native preview button and image dimensions without rendering an open dialog on the server',
    () => {
      const body = render(
        Image,
        {
          props: {
            src: 'photo.svg',
            alt: 'Photo',
            width: 120,
            height: 80,
            preview: { open: true }
          }
        }
      ).body;

      expect(body).toContain('<button');
      expect(body).toContain('type="button"');
      expect(body).toContain('width:120px');
      expect(body).toContain('src="photo.svg"');
      expect(body).not.toContain('<dialog');
    }
  );
  it(
    'renders passive image semantics when preview is disabled and does not fetch or create timers in SSR',
    () => {
      vi.useFakeTimers();
      try {
        const body = render(Image, { props: { src: 'photo.svg', preview: false } }).body;
        expect(body).not.toContain('<button');
        expect(body).toContain('<img');
        expect(vi.getTimerCount()).toBe(0);
      } finally { vi.useRealTimers(); }
    }
  );
  it('preserves placeholder snippets and lazy preview while rendering the fixture', () => {
    const body = render(ImageFixtures).body;

    expect(body).toContain('Image loading');
    expect(body.match(/Image loading/g)?.length).toBe(2);
    expect(body).not.toContain('ant-image-preview-actions-action');
  });
});
