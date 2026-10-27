import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Tabs from './Tabs.svelte';
import type { TabsItem, TabsProps } from './tabs.types';

const content = (text: string) => createRawSnippet(() => ({ render: () => `<p>${text}</p>` }));
const items: TabsItem[] = [{ key: '', label: 'Alpha', children: content('Alpha content') }, { key: 'locked', label: 'Locked', disabled: true, children: content('Locked content') }, { key: 'beta', label: 'Beta', children: content('Beta content') }];

describe('Tabs server rendering', () => {
  it('renders a named tablist, native tabs and associated panels with one selected tab stop', () => {
    const { body } = render(Tabs, { props: { items, 'aria-label': 'Account sections' } });

    expect(body).toContain('role="tablist" aria-label="Account sections"');
    expect(body.match(/role="tab"/g)).toHaveLength(3);
    expect(body.match(/role="tabpanel"/g)).toHaveLength(3);
    expect(body.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(body).toMatch(/<button[^>]*data-tabs-key=""[^>]*aria-selected="true"[^>]*tabindex="0"/);
    expect(body).toMatch(/<button[^>]*data-tabs-key="locked"[^>]*\sdisabled(?:[\s=>])/);
    expect(body.match(/type="button"/g)).toHaveLength(3);
    expect(body).not.toContain('type="submit"');
    const tabIds = [...body.matchAll(/role="tab" id="([^"]+)"[^>]*aria-controls="([^"]+)"/g)];
    expect(tabIds).toHaveLength(3);
    for (const [, tabId, panelId] of tabIds) expect(body).toContain(`id="${panelId}" role="tabpanel" aria-labelledby="${tabId}"`);
    expectTypeOf<NonNullable<TabsProps['onChange']>>().parameter(0).toEqualTypeOf<string>();
    expectTypeOf<NonNullable<TabsProps['onTabClick']>>().parameter(1).toEqualTypeOf<MouseEvent>();
  });

  it('renders only the initial panel content unless forceRender is requested', () => {
    const lazy = render(Tabs, { props: { items } }).body;
    const forced = render(Tabs, { props: { items: items.map((item) => ({ ...item, forceRender: true })) } }).body;

    expect(lazy).toContain('Alpha content');
    expect(lazy).not.toContain('Beta content');
    expect(lazy).not.toContain('Locked content');
    expect(forced).toContain('Beta content');
    expect(forced).toContain('Locked content');
    expect(forced.match(/role="tabpanel"[^>]*\shidden(?:[\s=>])/g)).toHaveLength(2);
  });

  it('resolves explicit and default keys without firing callbacks during SSR', () => {
    const fail = () => { throw new Error('Unexpected callback'); };
    const initial = render(Tabs, { props: { items, defaultActiveKey: 'beta', onChange: fail, onTabClick: fail } }).body;
    const controlled = render(Tabs, { props: { items, activeKey: '', defaultActiveKey: 'beta', onChange: fail } }).body;

    expect(initial).toContain('Beta content');
    expect(initial).not.toContain('Alpha content');
    expect(controlled).toContain('Alpha content');
    expect(controlled).not.toContain('Beta content');
  });

  it('falls back from a missing or disabled active key and leaves empty lists unselected', () => {
    const missing = render(Tabs, { props: { items, activeKey: 'missing' } }).body;
    const disabled = render(Tabs, { props: { items, activeKey: 'locked' } }).body;
    const empty = render(Tabs, { props: { items: [] } }).body;
    const locked = render(Tabs, { props: { items: items.map((item) => ({ ...item, disabled: true })) } }).body;

    expect(missing).toContain('Alpha content');
    expect(disabled).toContain('Alpha content');
    expect(empty).toContain('Ничего не найдено');
    expect(empty).not.toContain('role="tabpanel"');
    expect(locked).not.toContain('aria-selected="true"');
    expect(locked).not.toContain('Alpha content');
  });

  it('renders passive labels and decorative icons and escapes string content', () => {
    const label = createRawSnippet(() => ({ render: () => '<strong>Rich tab</strong>' }));
    const icon = createRawSnippet(() => ({ render: () => '<span>↗</span>' }));
    const { body } = render(Tabs, { props: { items: [{ key: 'rich', label, icon }, { key: 'escaped', label: '<script>Label</script>' }] } });

    expect(body).toContain('<strong>Rich tab</strong>');
    expect(body).toMatch(/ant-tabs-tab-icon[^>]*aria-hidden="true"/);
    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
  });

  it('keeps duplicate keys unique and safely associates unusual keys with panels', () => {
    const { body } = render(Tabs, { props: { items: [{ key: '"# ][🙂', label: 'Unusual' }, { key: '"# ][🙂', label: 'Duplicate' }, { key: '', label: 'Empty key' }] } });

    expect(body.match(/role="tab"/g)).toHaveLength(2);
    expect(body).not.toContain('Duplicate');
    const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((value) => !/\s/.test(value))).toBe(true);
  });

  it.each([['top', 'horizontal', 'top'], ['bottom', 'horizontal', 'bottom'], ['start', 'vertical', 'left'], ['end', 'vertical', 'right']] as const)('renders %s placement before hydration', (tabPlacement, orientation, physical) => {
    const { body } = render(Tabs, { props: { items, tabPlacement, type: 'card', size: 'small', id: 'profile-tabs', 'aria-labelledby': 'profile-title' } });

    expect(body).toContain(`ant-tabs-${physical}`);
    expect(body).toContain(`aria-orientation="${orientation}"`);
    expect(body).toContain('ant-tabs-card');
    expect(body).toContain('ant-tabs-small');
    expect(body).toContain('id="profile-tabs"');
    expect(body).toContain('aria-labelledby="profile-title"');
  });
});
