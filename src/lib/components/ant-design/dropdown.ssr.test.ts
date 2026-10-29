import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Dropdown from './Dropdown.svelte';
import type { DropdownClickInfo, DropdownItem, DropdownProps } from './dropdown.types';

const children = createRawSnippet(() => ({ render: () => '<button type="button">Actions</button>' }));
const items: DropdownItem[] = [{ key: 'open', label: 'Open' }, { key: 'export', label: 'Export', disabled: true }, { key: 'divider', type: 'divider' }, { key: 'archive', label: 'Archive', danger: true }];

describe('Dropdown server rendering', () => {
  it('renders a named hidden menu with native commands, a separator and disabled actions', () => {
    const { body } = render(Dropdown, { props: { children, menu: { items } } });

    expect(body).toMatch(/popover="manual"[^>]*\shidden(?:[\s=>])/);
    expect(body).toContain('role="menu"');
    expect(body).toContain('aria-labelledby="ant-dropdown-');
    expect(body.match(/role="menuitem"/g)).toHaveLength(3);
    expect(body).toContain('role="separator"');
    expect(body).toMatch(/<button[^>]*\sdisabled(?:[\s=>])[^>]*ant-dropdown-menu-item-disabled/);
    expect(body).toContain('ant-dropdown-menu-item-danger');
    expect(body.match(/type="button"/g)).toHaveLength(4);
    expect(body).not.toContain('type="submit"');
    expectTypeOf<NonNullable<DropdownProps['menu']['onClick']>>().parameter(0).toEqualTypeOf<DropdownClickInfo>();
  });

  it('renders passive snippets, decorative icons and an explicit accessible name', () => {
    const label = createRawSnippet(() => ({ render: () => '<strong>Rich label</strong>' }));
    const icon = createRawSnippet(() => ({ render: () => '<span>↗</span>' }));
    const { body } = render(Dropdown, { props: { children, 'aria-label': 'Record actions', arrow: true, menu: { items: [{ key: 'rich', label, icon, textValue: 'Open details' }] } } });

    expect(body).toContain('<strong>Rich label</strong>');
    expect(body).toContain('<span>↗</span>');
    expect(body).toMatch(/ant-dropdown-menu-item-icon[^>]*aria-hidden="true"/);
    expect(body).toContain('aria-label="Open details"');
    expect(body).toContain('aria-label="Record actions"');
    expect(body).toContain('ant-dropdown-arrow');
  });

  it('renders native links with target/rel and removes href from disabled links while retaining buttons for commands', () => {
    const { body } = render(Dropdown, { props: { children, menu: { items: [
      { key: 'link', label: 'Open page', href: '/page', target: '_blank', rel: 'noopener' },
      { key: 'locked', label: 'Locked page', href: '/locked', disabled: true },
      { key: 'action', label: 'Action' }
    ] } } });

    expect(body).toMatch(/<a[^>]*href="\/page"[^>]*target="_blank"[^>]*rel="noopener"[^>]*role="menuitem"/);
    expect(body).not.toContain('href="/locked"');
    expect(body).toMatch(/<a[^>]*aria-disabled="true"/);
    expect(body).toMatch(/<button[^>]*type="button"[^>]*data-dropdown-key="action"/);
  });

  it('escapes labels and unusual keys and keeps only the first duplicate', () => {
    const { body } = render(Dropdown, { props: { children, menu: { items: [{ key: '"[data-key]', label: '<script>Open</script>' }, { key: '"[data-key]', label: 'Duplicate' }] } } });

    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
    expect(body).not.toContain('Duplicate');
    expect(body.match(/role="menuitem"/g)).toHaveLength(1);
  });

  it('renders an empty state without inventing an actionable command', () => {
    const { body } = render(Dropdown, { props: { children, menu: { items: [] } } });

    expect(body).toContain('Ничего не найдено');
    expect(body).not.toContain('role="menuitem"');
    expect(body).not.toContain('class="ant-dropdown-arrow');
  });

  it.each(['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as const)('preserves %s placement before hydration', (placement) => {
    const { body } = render(Dropdown, { props: { children, menu: { items }, placement } });

    expect(body).toContain(`ant-dropdown-placement-${placement}`);
  });

  it('keeps defaultOpen SSR safe and emits no owner or action callback', () => {
    const fail = () => { throw new Error('Unexpected callback'); };
    const { body } = render(Dropdown, { props: { children, defaultOpen: true, onOpenChange: fail, menu: { items, onClick: fail } } });

    expect(body).toMatch(/popover="manual"[^>]*\shidden(?:[\s=>])/);
    expect(body).toContain('<button type="button">Actions</button>');
  });
});
