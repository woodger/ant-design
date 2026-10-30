import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Badge from './Badge.svelte';
import type { BadgeContext } from './badge.types';

const children = createRawSnippet<[BadgeContext]>(
  context => ({
    render: () => `<button type="button"${context().descriptionId
      ? ` aria-describedby="${context().descriptionId}"`
      : ''}>Inbox</button>`
  })
);

describe('Badge server rendering', () => {
  it('renders a full accessible count beside its abbreviated decorative indicator', () => {
    const body = render(Badge, { props: { count: 120 } }).body;

    expect(body).toContain('99+');
    expect(body).toContain('Количество: 120');
    expect(body).toContain('title="120"');
    expect(body).toContain('aria-hidden="true"');
    expect(body).toContain('ant-badge-not-a-wrapper');
    expect(body).not.toContain('role="status"');
    expect(body).not.toContain('aria-live');
    expect(body).not.toContain('tabindex');
  });
  it(
    'provides a stable description reference to an interactive child without changing its semantics',
    () => {
      const body = render(Badge, { props: { children, count: 120, id: 'messages' } }).body;

      expect(body).toContain('aria-describedby="messages-description"');
      expect(body).toContain('id="messages-description"');
      expect(body).toContain('Количество: 120');
      expect(body).toContain('type="button"');
      expect(body).not.toContain('ant-badge-not-a-wrapper');
      expect(body).not.toContain('role="button"');
    }
  );
  it('keeps children while zero hides the indicator and removes its unused description', () => {
    const body = render(Badge, { props: { children, count: 0 } }).body;

    expect(body).toContain('Inbox');
    expect(body).not.toContain('<sup');
    expect(body).not.toContain('aria-describedby=');
    expect(body).not.toContain('ant-badge-description');
    const zero = render(Badge, { props: { count: 0, showZero: true, dot: true } }).body;

    expect(zero).toContain('Количество: 0');
    expect(zero).toContain('ant-badge-count');
    expect(zero).not.toContain('ant-badge-dot');
  });
  it('supports dot mode, small count size and explicit native title suppression', () => {
    const dot = render(Badge, { props: { dot: true, count: 5, children } }).body;

    expect(dot).toContain('ant-badge-dot');
    expect(dot).toContain('Количество: 5');
    expect(dot).not.toContain('<bdi');
    const small = render(Badge, { props: { count: 5, size: 'small', title: false } }).body;

    expect(small).toContain('ant-badge-count-sm');
    expect(small).not.toContain('title=');
    expect(render(Badge, { props: { count: 5, title: 'Unread' } }).body).toContain(
      'title="Unread"'
    );
  });
  it.each(['success', 'processing', 'default', 'error', 'warning'] as const)(
    'renders %s status without a live region',
    status => {
      const text = createRawSnippet(() => ({ render: () => '<strong>Service</strong>' }));
      const body = render(Badge, { props: { status, text } }).body;

      expect(body).toContain(`ant-badge-status-${status}`);
      expect(body).toContain('ant-badge-status-dot');
      expect(body).toContain('<strong>Service</strong>');
      expect(body).not.toContain('<sup');
      expect(body).not.toContain('aria-live');
    }
  );
  it('escapes text and attributes while forwarding owner names, styling and offsets', () => {
    const body = render(
      Badge,
      {
        props: {
          status: 'success',
          text: '<img src=x>',
          'aria-label': 'Service state',
          'aria-describedby': 'hint',
          id: 'state',
          class: 'custom',
          style: 'margin: 4px',
          offset: [12, -6]
        }
      }
    ).body;

    expect(body).toContain('&lt;img src=x>');
    expect(body).not.toContain('<img');
    expect(body).toContain('role="group"');
    expect(body).toContain('aria-label="Service state"');
    expect(body).toContain('aria-describedby="hint"');
    expect(body).toContain('id="state"');
    expect(body).toContain('custom');
    expect(body).toContain('margin: 4px');
    expect(body).toContain('--ant-badge-offset-inline: -12px');
    expect(body).toContain('--ant-badge-offset-top: -6px');
  });
  it('does not allocate timers or DOM resources when rendering interactive content', () => {
    vi.useFakeTimers();
    try {
      render(Badge, { props: { children, count: 5 } });
      expect(vi.getTimerCount()).toBe(0);
    }
    finally {
      vi.useRealTimers();
    }
  });
});
