import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Spin from './Spin.svelte';

describe('Spin server rendering', () => {
  it('renders an immediate named status and four decorative dots', () => {
    const body = render(Spin).body;
    expect(body).toContain('role="status"'); expect(body).toContain('aria-live="polite"'); expect(body).toContain('aria-label="Загрузка…"');
    expect(body.match(/class="ant-spin-dot-item /g)).toHaveLength(4); expect(body).toContain('aria-hidden="true"');
    expect(body).not.toContain('tabindex='); expect(body).not.toContain('<button');
  });
  it('keeps inactive and delayed standalone indicators hidden before hydration', () => {
    for (const props of [{ spinning: false }, { delay: 200 }]) {
      const body = render(Spin, { props }).body;
      expect(body).toContain(' hidden'); expect(body).not.toContain('role="status"'); expect(body).not.toContain('ant-spin-dot-item');
    }
  });
  it('blocks busy content immediately while the indicator is still delayed', () => {
    const children = createRawSnippet(() => ({ render: () => '<input value="Retained draft" />' }));
    const body = render(Spin, { props: { children, delay: 200, 'aria-label': 'Profile' } }).body;
    expect(body).toContain('role="group"'); expect(body).toContain('aria-label="Profile"'); expect(body).toContain('tabindex="-1"');
    expect(body).toContain('inert'); expect(body).toContain('aria-busy="true"'); expect(body).toContain('Retained draft');
    expect(body).not.toContain('role="status"');
  });
  it('retains the same content markup when loading is inactive', () => {
    const children = createRawSnippet(() => ({ render: () => '<input value="Draft" />' }));
    const body = render(Spin, { props: { children, spinning: false } }).body;
    expect(body).toContain('aria-busy="false"'); expect(body).not.toContain(' inert'); expect(body).toContain('value="Draft"');
    expect(body).not.toContain('aria-live');
  });
  it('supports escaped descriptions, passive snippets and custom decorative indicators', () => {
    const indicator = createRawSnippet(() => ({ render: () => '<span>Custom indicator</span>' }));
    const description = createRawSnippet(() => ({ render: () => '<strong>Loading details</strong>' }));
    const rich = render(Spin, { props: { indicator, description } }).body;
    expect(rich).toContain('Custom indicator'); expect(rich).toContain('<strong>Loading details</strong>'); expect(rich).not.toContain('ant-spin-dot-item');
    const escaped = render(Spin, { props: { description: '<script>Unsafe</script>' } }).body;
    expect(escaped).toContain('&lt;script>'); expect(escaped).not.toContain('<script>');
  });
  it('supports sizes and root attributes without exposing a decorative table indicator as a live region', () => {
    const body = render(Spin, { props: { size: 'large', description: 'Loading data', id: 'busy', class: 'custom', style: 'margin: 4px', 'aria-hidden': true } }).body;
    expect(body).toContain('ant-spin-lg'); expect(body).toContain('id="busy"'); expect(body).toContain('custom'); expect(body).toContain('margin: 4px');
    expect(body).not.toContain('role="status"'); expect(body).not.toContain('aria-live');
  });
  it('does not schedule timers on the server', () => {
    vi.useFakeTimers();
    try { render(Spin, { props: { delay: 500 } }); expect(vi.getTimerCount()).toBe(0); } finally { vi.useRealTimers(); }
  });
});
