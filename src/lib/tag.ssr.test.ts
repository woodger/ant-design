import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Tag from './Tag.svelte';
import CheckableTag from './CheckableTag.svelte';

const children = createRawSnippet(() => ({ render: () => '<strong>Frontend</strong>' }));

describe('Tag server rendering', () => {
  it(
    'renders passive content without a close button, focus stop or announcement by default',
    () => {
      const body = render(Tag, { props: { children } }).body;

      expect(body).toContain('<span');
      expect(body).toContain('<strong>Frontend</strong>');
      expect(body).toContain('ant-tag-default');
      expect(body).toContain('ant-tag-filled');
      expect(body).not.toContain('<button');
      expect(body).not.toContain('role=');
      expect(body).not.toContain('tabindex');
      expect(body).not.toContain('aria-live');
    }
  );
  it.each(['filled', 'outlined', 'solid'] as const)(
    'renders the %s variant with a status color',
    variant => {
      const body = render(Tag, { props: { children, variant, color: 'success' } }).body;

      expect(body).toContain(`ant-tag-${variant}`);
      expect(body).toContain('ant-tag-success');
      expect(body).not.toContain('role="status"');
    }
  );
  it('renders a native close button with localized naming and content description', () => {
    const body = render(Tag, { props: { children, closeIcon: true } }).body;

    expect(body).toContain('type="button"');
    expect(body).toContain('aria-label="Закрыть"');
    const described = body.match(/aria-describedby="([^"]+)"/);

    expect(described).not.toBeNull();
    expect(body).toContain(`id="${described![1]}"`);
    expect(body).toContain('aria-hidden="true"');
    expect(body).toContain('focusable="false"');
  });
  it('renders custom decorative icons inside their inert wrappers and disables closing', () => {
    const icon = createRawSnippet(
      () => ({ render: () => '<svg viewBox="0 0 20 20"><circle r="8" /></svg>' })
    );
    const closeIcon = createRawSnippet(() => ({ render: () => '<span>×</span>' }));
    const body = render(
      Tag,
      { props: { children, icon, closeIcon, disabled: true, closeLabel: 'Remove Frontend' } }
    ).body;

    expect(body).toContain('viewBox="0 0 20 20"');
    expect(body).toContain('ant-tag-disabled');
    expect(body).toContain(' disabled');
    expect(body).toContain('aria-label="Remove Frontend"');
    expect(body.match(/ inert/g)).toHaveLength(2);
  });
  it('forwards owner naming, attributes and styling with attribute escaping', () => {
    const body = render(
      Tag,
      {
        props: {
          children,
          id: 'tag"unsafe',
          'aria-label': 'Owner tag',
          'aria-describedby': 'hint',
          class: 'custom',
          style: 'margin: 4px'
        }
      }
    ).body;

    expect(body).toContain('role="group"');
    expect(body).toContain('aria-label="Owner tag"');
    expect(body).toContain('aria-describedby="hint"');
    expect(body).toContain('id="tag&quot;unsafe"');
    expect(body).toContain('custom');
    expect(body).toContain('margin: 4px');
  });
  it(
    'renders closeable tags without calling callbacks, starting timers or accessing the DOM',
    () => {
      vi.useFakeTimers();
      try {
        const close = vi.fn();
        render(Tag, { props: { children, closeIcon: true, onClose: close } });
        expect(close).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
      }
      finally {
        vi.useRealTimers();
      }
    }
  );
});

describe('CheckableTag server rendering', () => {
  it.each([false, true])('renders a native toggle button with pressed=%s', checked => {
    const body = render(CheckableTag, { props: { children, checked } }).body;

    expect(body).toContain('<button');
    expect(body).toContain('type="button"');
    expect(body).toContain(`aria-pressed="${checked}"`);
    expect(body).toContain('<strong>Frontend</strong>');
    expect(body.includes('ant-tag-checkable-checked')).toBe(checked);
    expect(body).not.toContain('role="checkbox"');
    expect(body).not.toContain('<input');
    expect(body).not.toContain('aria-live');
  });
  it('disables the native button without dropping its selected state', () => {
    const body = render(
      CheckableTag,
      {
        props: {
          children,
          checked: true,
          disabled: true,
          'aria-label': 'Owner filter',
          'aria-describedby': 'filter-hint'
        }
      }
    ).body;

    expect(body).toContain(' disabled');
    expect(body).toContain('aria-pressed="true"');
    expect(body).toContain('ant-tag-checkable-disabled');
    expect(body).toContain('aria-label="Owner filter"');
    expect(body).toContain('aria-describedby="filter-hint"');
  });
  it('does not emit changes or allocate timers during server rendering', () => {
    vi.useFakeTimers();
    try {
      const change = vi.fn();
      render(CheckableTag, { props: { children, checked: true, onChange: change } });
      expect(change).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    }
    finally {
      vi.useRealTimers();
    }
  });
});
