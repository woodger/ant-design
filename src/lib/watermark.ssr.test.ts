import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Watermark from './Watermark.svelte';

describe('Watermark SSR', () => {
  it('renders children without accessing Canvas, images or mutation observers', () => {
    const events: unknown[] = [];
    const body = render(Watermark, { props: { content: 'Not SSR text', image: '/server-not-requested.svg', onRemove: () => events.push('remove'), children: createRawSnippet(() => ({ render: () => '<p>Content</p>' })) } }).body;
    expect(body).toContain('<p>Content</p>');
    expect(body).toContain('position:relative;overflow:hidden');
    expect(body).not.toContain('Not SSR text'); expect(body).not.toContain('background-image'); expect(body).not.toContain('<canvas');
    expect(events).toEqual([]);
  });

  it('keeps explicit styles after defaults and renders an empty optional child', () => {
    const body = render(Watermark, { props: { inherit: false, style: 'position:static;overflow:visible', class: 'owner', rootClassName: 'root' } }).body;
    expect(body).toContain('owner root');
    expect(body).toContain('position:relative;overflow:hidden;position:static;overflow:visible');
  });

});
