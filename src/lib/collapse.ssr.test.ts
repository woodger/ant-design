import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Collapse from './Collapse.svelte';
import type { CollapseItem, CollapseProps } from './collapse.types';

const content = (value: string) => createRawSnippet(() => ({ render: () => `<p>${value}</p>` }));
const items: CollapseItem[] = [{ key: '', label: 'Profile', children: content('Profile content') }, { key: 'locked', label: 'Locked', collapsible: 'disabled', children: content('Locked content') }, { key: 'settings', label: 'Settings', children: content('Settings content') }];

describe('Collapse server rendering', () => {
  it('renders native heading buttons with expanded state and linked hidden panels', () => {
    const { body } = render(Collapse, { props: { items, 'aria-label': 'Account sections', headingLevel: 2 } });

    expect(body).toContain('role="group" aria-label="Account sections"');
    expect(body.match(/<h2\b/g)).toHaveLength(3);
    expect(body.match(/aria-expanded="false"/g)).toHaveLength(3);
    expect(body.match(/role="region"[^>]*\shidden(?:[\s=>])/g)).toHaveLength(3);
    expect(body.match(/type="button"/g)).toHaveLength(3);
    expect(body).not.toContain('type="submit"');
    const controls = [...body.matchAll(/<button[^>]*id="([^"]+)"[^>]*aria-controls="([^"]+)"/g)];
    expect(controls).toHaveLength(3);
    for (const [, trigger, panel] of controls) expect(body).toContain(`id="${panel}" role="region" aria-labelledby="${trigger}"`);
    expect(body).not.toContain('Profile content');
    expectTypeOf<NonNullable<CollapseProps['onChange']>>().parameter(0).toEqualTypeOf<string[]>();
  });

  it('renders requested independent panels, including a disabled panel controlled by its owner', () => {
    const { body } = render(Collapse, { props: { items, activeKey: ['', 'locked'] } });

    expect(body.match(/aria-expanded="true"/g)).toHaveLength(2);
    expect(body).toContain('Profile content');
    expect(body).toContain('Locked content');
    expect(body).not.toContain('Settings content');
    expect(body).toMatch(/<button[^>]*data-collapse-trigger="locked"[^>]*\sdisabled(?:[\s=>])/);
  });

  it('uses the first requested key in accordion mode without selecting a fallback for an unknown key', () => {
    const selected = render(Collapse, { props: { items, accordion: true, activeKey: ['settings', ''] } }).body;
    const missing = render(Collapse, { props: { items, accordion: true, activeKey: ['missing', 'settings'] } }).body;

    expect(selected.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(selected).toContain('Settings content');
    expect(selected).not.toContain('Profile content');
    expect(missing).not.toContain('aria-expanded="true"');
  });

  it('keeps forceRender content hidden and gives it priority over destroyOnHidden', () => {
    const { body } = render(Collapse, { props: { items: items.map((item) => ({ ...item, forceRender: true })), destroyOnHidden: true } });

    expect(body).toContain('Profile content');
    expect(body).toContain('Locked content');
    expect(body).toContain('Settings content');
    expect(body.match(/role="region"[^>]*\shidden(?:[\s=>])/g)).toHaveLength(3);
  });

  it('reads defaults without invoking onChange and lets explicit empty values override them', () => {
    const fail = () => { throw new Error('Unexpected callback'); };
    const initial = render(Collapse, { props: { items, defaultActiveKey: 'settings', onChange: fail } }).body;
    const controlled = render(Collapse, { props: { items, activeKey: [], defaultActiveKey: 'settings', onChange: fail } }).body;

    expect(initial).toContain('Settings content');
    expect(controlled).not.toContain('Settings content');
    expect(controlled).not.toContain('aria-expanded="true"');
  });

  it('renders passive labels and independent extra actions outside the heading button', () => {
    const label = createRawSnippet(() => ({ render: () => '<strong>Rich section</strong>' }));
    const extra = createRawSnippet(() => ({ render: () => '<button type="button">Extra action</button>' }));
    const { body } = render(Collapse, { props: { items: [{ key: 'rich', label, extra }] } });

    expect(body).toContain('<strong>Rich section</strong>');
    expect(body).toContain('Extra action');
    const heading = body.match(/<h3\b[\s\S]*?<\/h3>/)?.[0] ?? '';
    expect(heading.match(/<button\b/g)).toHaveLength(1);
    expect(heading).not.toContain('Extra action');
    expect(body).toContain('aria-hidden="true"');
  });

  it('escapes labels, deduplicates keys and creates safe unique IDs for unusual keys', () => {
    const { body } = render(Collapse, { props: { items: [{ key: '" ][🙂', label: '<script>Section</script>' }, { key: '" ][🙂', label: 'Duplicate' }, { key: '', label: 'Empty key' }] } });

    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>');
    expect(body).not.toContain('Duplicate');
    const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((value) => !/\s/.test(value))).toBe(true);
    expect(body.match(/<button\b/g)).toHaveLength(2);
  });

  it('falls back from icon-only mode when the arrow is hidden', () => {
    const { body } = render(Collapse, { props: { items: [{ key: 'plain', label: 'Plain', showArrow: false }], collapsible: 'icon' } });

    expect(body).not.toContain('ant-collapse-trigger-icon');
    expect(body).not.toContain('ant-collapse-expand-icon');
    expect(body).toContain('aria-expanded="false"');
  });

  it('does not create excessive landmarks in a large independently expandable list', () => {
    const many = Array.from({ length: 7 }, (_, index) => ({ key: String(index), label: `Section ${index}` }));
    const plain = render(Collapse, { props: { items: many } }).body;
    const accordion = render(Collapse, { props: { items: many, accordion: true } }).body;

    expect(plain).not.toContain('role="region"');
    expect(accordion.match(/role="region"/g)).toHaveLength(7);
    expect(plain.match(/aria-controls=/g)).toHaveLength(7);
  });

  it('renders an empty state and scoped appearance variants safely before hydration', () => {
    const { body } = render(Collapse, { props: { items: [], bordered: false, ghost: true, size: 'small', expandIconPlacement: 'end', id: 'account-collapse' } });

    expect(body).toContain('Ничего не найдено');
    expect(body).toContain('ant-collapse-borderless');
    expect(body).toContain('ant-collapse-ghost');
    expect(body).toContain('ant-collapse-small');
    expect(body).toContain('ant-collapse-icon-placement-end');
    expect(body).toContain('id="account-collapse"');
    expect(body).not.toContain('aria-controls=');
  });
});
