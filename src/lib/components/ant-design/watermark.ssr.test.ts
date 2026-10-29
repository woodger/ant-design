import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Watermark from './Watermark.svelte';
import WatermarkFixtures from '../../../../e2e/fixtures/WatermarkFixtures.svelte';

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

  it('merges component config and leaves popup markup unchanged on the server', () => {
    const body = render(WatermarkFixtures).body;
    expect(body).toContain('fixture-watermark watermark-context watermark-owner');
    expect(body).toContain('position:relative;overflow:hidden;overflow:visible;opacity:0.9;height:240px;overflow:hidden;position:relative;opacity:1');
    expect(body).toContain('ant-modal-container'); expect(body).toContain('Modal protected content');
    expect(body).not.toContain('background-image:');
    expect(body).not.toMatch(/class="isolated-watermark watermark-context/);
  });
});
