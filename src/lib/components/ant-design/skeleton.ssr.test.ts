import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Skeleton from './Skeleton.svelte';

describe('Skeleton server rendering', () => {
  it('renders a named group, a separate polite status and decorative placeholder geometry', () => {
    const body = render(Skeleton).body;
    expect(body).toContain('role="group"'); expect(body).toContain('role="status"'); expect(body).toContain('aria-live="polite"'); expect(body).toContain('aria-atomic="true"');
    expect(body).toContain('Загрузка…'); expect(body).toContain('aria-busy="true"'); expect(body).toContain('aria-hidden="true"');
    expect(body.match(/<li /g)).toHaveLength(3); expect(body).toContain('width: 38%'); expect(body).toContain('width: 61%');
    expect(body).not.toContain('tabindex='); expect(body).not.toContain('ant-skeleton-avatar '); expect(body).not.toContain('ant-skeleton-active');
  });
  it('does not mount children while loading and renders them only when ready', () => {
    const children = createRawSnippet(() => ({ render: () => '<input value="Ready draft" />' }));
    const loading = render(Skeleton, { props: { children } }).body;
    expect(loading).not.toContain('Ready draft'); expect(loading).toContain('tabindex="-1"');
    const ready = render(Skeleton, { props: { children, loading: false } }).body;
    expect(ready).toContain('Ready draft'); expect(ready).toContain('aria-busy="false"'); expect(ready).not.toContain('role="status"'); expect(ready).not.toContain('ant-skeleton-paragraph');
  });
  it('supports an empty ready state and independently hidden placeholder parts', () => {
    expect(render(Skeleton, { props: { loading: false } }).body).not.toContain('<li ');
    const body = render(Skeleton, { props: { avatar: true, title: false, paragraph: false } }).body;
    expect(body).toContain('ant-skeleton-avatar-circle'); expect(body).not.toContain('ant-skeleton-title'); expect(body).not.toContain('<ul ');
  });
  it('renders custom avatar geometry, active round shapes and individual widths', () => {
    const body = render(Skeleton, { props: { active: true, round: true, avatar: { size: 64, shape: 'square' }, title: { width: 100 }, paragraph: { rows: 2, width: ['80%', 60] } } }).body;
    expect(body).toContain('ant-skeleton-active'); expect(body).toContain('ant-skeleton-round'); expect(body).toContain('ant-skeleton-avatar-square');
    for (const width of ['64px', '100px', '80%', '60px']) expect(body).toContain(`width: ${width}`);
    expect(body.match(/<li /g)).toHaveLength(2);
  });
  it('escapes root attributes and supports decorative previews without live announcements', () => {
    const body = render(Skeleton, { props: { id: 'preview', class: 'custom', style: 'margin: 4px', 'aria-label': '<script>Unsafe</script>', 'aria-describedby': 'hint', 'aria-hidden': true } }).body;
    expect(body).toContain('id="preview"'); expect(body).toContain('custom'); expect(body).toContain('margin: 4px'); expect(body).toContain('aria-describedby="hint"');
    expect(body).toContain('&lt;script>'); expect(body).not.toContain('<script>'); expect(body).not.toContain('role="status"'); expect(body).not.toContain('aria-live');
  });
  it('renders without scheduling timers on the server', () => {
    vi.useFakeTimers();
    try { render(Skeleton, { props: { active: true } }); expect(vi.getTimerCount()).toBe(0); } finally { vi.useRealTimers(); }
  });
});
