import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Masonry, type MasonryProps } from 'antd-svelte';
import MasonryFixtures from '../browser/fixtures/MasonryFixtures.svelte';

describe('Masonry package SSR', () => {
  it('keeps the pinned empty server root and does not invoke item snippets or layout callbacks', () => {
    const events: string[] = [];
    const props: MasonryProps<{ title: string }> = {
      children: createRawSnippet(() => {
        events.push('children');

        return { render: () => '<p>Unused root children</p>' };
      }),
      items: [{ key: 'a', data: { title: 'Only after mount' } }],
      itemRender: createRawSnippet(() => {
        events.push('render');

        return { render: () => '<p>Only after mount</p>' };
      }),
      onLayoutChange: () => events.push('layout')
    };

    const body = render(Masonry<{ title: string }>, { props }).body;

    expect(body).toContain('height:0px');
    expect(body).not.toContain('Only after mount');
    expect(body).not.toContain('ant-masonry-item');
    expect(body).not.toContain('Unused root children');
    expect(events).toEqual([]);
  });

  it('renders inherited config with resolved SSR columns in the owned fixture', () => {
    const body = render(MasonryFixtures).body;

    expect(body).toContain('id="masonry-fixture"');
    expect(body).toContain('masonry-context context-columns-3 local-columns-3');
    expect(body).toContain('height:0px;border-radius:4px;outline-offset:6px');
    expect(body).not.toContain('aria-label="Masonry draft a"');
  });
});
