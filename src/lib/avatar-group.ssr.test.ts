import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import AvatarGroup from './AvatarGroup.svelte';
import type { AvatarGroupItem } from './avatar-group.types';

const items: AvatarGroupItem[] = [
  { key: 'a', label: 'Анна', text: 'АН' },
  { key: 'b', label: 'Дмитрий', text: 'ДО' },
  { key: 'c', label: 'Вера', src: '/hidden-portrait.svg', text: 'ВС' }
];

describe('AvatarGroup server rendering', () => {
  it('renders a named group with a passive accessible avatar for each participant', () => {
    const body = render(AvatarGroup, { props: { items } }).body;

    expect(body).toContain('role="group"');
    expect(body).toContain('aria-label="Участники"');
    for (const item of items)
      expect(body).toContain(`aria-label="${item.label}"`);

    expect(body).not.toContain('<button');
    expect(body).not.toContain('aria-live');
    expect(body).not.toContain('role="status"');
  });
  it('renders a native overflow button but keeps hidden avatars lazy before hydration', () => {
    const body = render(AvatarGroup, { props: { items, max: { count: 1 } } }).body;

    expect(body).toContain('type="button"');
    expect(body).toContain('aria-label="Ещё участников: 2"');
    expect(body).toContain('+2');
    expect(body).toContain('aria-label="Анна"');
    expect(body).not.toContain('/hidden-portrait.svg');
    expect(body).not.toContain('aria-label="Дмитрий"');
    expect(body).not.toContain('<ul');
  });
  it('inherits group size and shape but preserves item overrides and snippet priority', () => {
    const children = createRawSnippet(() => ({ render: () => '<strong>SN</strong>' }));
    const body = render(
      AvatarGroup,
      {
        props: {
          items: [
            { key: 1, label: 'Small', text: 'Ignored', size: 'small', shape: 'circle', children },
            { key: 2, label: 'Large', text: 'LG' }
          ],
          size: 'large',
          shape: 'square'
        }
      }
    ).body;

    expect(body).toContain('ant-avatar-sm');
    expect(body).toContain('ant-avatar-circle');
    expect(body).toContain('ant-avatar-lg');
    expect(body).toContain('ant-avatar-square');
    expect(body).toContain('<strong>SN</strong>');
    expect(body).not.toContain('Ignored');
  });
  it(
    'escapes labels and text and forwards root attributes without leaking item metadata',
    () => {
      const body = render(
        AvatarGroup,
        {
          props: {
            items: [{ key: 'private-key', label: '<img src=x>', text: '<script>' }],
            id: 'team',
            'aria-label': 'Project team',
            'aria-describedby': 'hint',
            class: 'custom',
            style: 'padding: 8px'
          }
        }
      ).body;

      expect(body).toContain('aria-label="&lt;img src=x>"');
      expect(body).toContain('&lt;script>');
      expect(body).not.toContain('<img');
      expect(body).not.toContain('private-key');
      expect(body).toContain('id="team"');
      expect(body).toContain('aria-label="Project team"');
      expect(body).toContain('aria-describedby="hint"');
      expect(body).toContain('custom');
      expect(body).toContain('padding: 8px');
    }
  );
  it('does not allocate DOM resources timers or image callbacks during SSR', () => {
    const onError = vi.fn();
    vi.useFakeTimers();
    try {
      render(
        AvatarGroup,
        { props: { items: items.map(item => ({ ...item, onError })), max: { count: 1 } } }
      );
      expect(onError).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    }
    finally {
      vi.useRealTimers();
    }
  });
});
