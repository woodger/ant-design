import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Empty from './Empty.svelte';

describe('Empty server rendering', () => {
  it(
    'renders the default decorative illustration and description without announcements or focus stops',
    () => {
      const body = render(Empty).body;

      expect(body).toContain('Нет данных');
      expect(body).toContain('viewBox="0 0 184 152"');
      expect(body).toContain('aria-hidden="true"');
      expect(body).toContain('focusable="false"');
      expect(body).toContain(' inert');
      expect(body).not.toContain('role=');
      expect(body).not.toContain('aria-live');
      expect(body).not.toContain('tabindex');
      expect(body).not.toContain('<title');
      expect(body).not.toContain('ant-empty-footer');
    }
  );
  it('renders the simple illustration and its compact image container', () => {
    const body = render(Empty, { props: { image: 'simple' } }).body;

    expect(body).toContain('ant-empty-normal');
    expect(body).toContain('viewBox="0 0 64 41"');
    expect(body).toContain('Нет данных');
  });
  it('can hide the image, description or both independently', () => {
    const noImage = render(Empty, { props: { image: false } }).body;

    expect(noImage).not.toContain('<svg');
    expect(noImage).not.toContain('ant-empty-image');
    expect(noImage).toContain('Нет данных');
    for (const description of [false, ''] as const) {
      const body = render(Empty, { props: { description } }).body;
      expect(body).not.toContain('ant-empty-description');
      expect(body).not.toContain('Нет данных');
      expect(body).toContain('<svg');
    }
    const empty = render(Empty, { props: { image: false, description: false } }).body;

    expect(empty).not.toContain('ant-empty-image');
    expect(empty).not.toContain('ant-empty-description');
  });
  it('renders custom image and description snippets and native footer actions', () => {
    const image = createRawSnippet(
      () => ({ render: () => '<svg viewBox="0 0 20 20"><circle r="8" /></svg>' })
    );
    const description = createRawSnippet(
      () => ({ render: () => '<strong>No members yet</strong>' })
    );
    const children = createRawSnippet(
      () => ({ render: () => '<button type="button">Create a member</button>' })
    );
    const body = render(Empty, { props: { image, description, children } }).body;

    expect(body).toContain('viewBox="0 0 20 20"');
    expect(body).not.toContain('<pattern');
    expect(body).toContain('<strong>No members yet</strong>');
    expect(body).toContain('ant-empty-footer');
    expect(body).toContain('<button type="button">Create a member</button>');
    expect(body).not.toContain('aria-live');
  });
  it('escapes descriptions and root attributes and supports an explicitly named group', () => {
    const body = render(
      Empty,
      {
        props: {
          description: '<script>Unsafe</script>',
          id: 'empty-state',
          class: 'custom',
          style: 'margin: 4px',
          'aria-label': 'Empty members',
          'aria-describedby': 'hint'
        }
      }
    ).body;

    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
    expect(body).toContain('role="group"');
    expect(body).toContain('aria-label="Empty members"');
    expect(body).toContain('aria-describedby="hint"');
    expect(body).toContain('id="empty-state"');
    expect(body).toContain('custom');
    expect(body).toContain('margin: 4px');
  });
  it('forwards labelledby without adding a default accessible name', () => {
    const body = render(Empty, { props: { 'aria-labelledby': 'owner-title' } }).body;

    expect(body).toContain('role="group"');
    expect(body).toContain('aria-labelledby="owner-title"');
    expect(body).not.toContain('aria-label=');
  });
  it('binds every SVG paint reference to a local opaque token composition', () => {
    for (const image of ['default', 'simple'] as const) {
      const body = render(Empty, { props: { image } }).body;
      const ids = [...body.matchAll(/<pattern\b[^>]*id="([^"]+)"/g)].map(match => match[1]);
      const references = [...body.matchAll(/(?:fill|stroke)="url\(#([^)]+)\)"/g)].map(
        match => match[1]
      );
      expect(ids).toHaveLength(image === 'simple' ? 3 : 4);
      expect(new Set(ids).size).toBe(ids.length);
      expect(references.length).toBeGreaterThan(0);
      for (const reference of references)
        expect(ids).toContain(reference);
      expect(body).toContain('fill="var(--ant-color-bg-container)"');
      expect(body).toContain('fill="var(--ant-color-fill-tertiary)"');
    }
  });
  it(
    'does not schedule timers or access the DOM while rendering footer actions on the server',
    () => {
      vi.useFakeTimers();
      try {
        const children = createRawSnippet(() => ({ render: () => '<button>Retry</button>' }));
        render(Empty, { props: { children } });
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    }
  );
});
