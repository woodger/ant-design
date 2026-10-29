import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AntDesignShowcase from '$lib/presentation/ant-design/AntDesignShowcase.svelte';
import Input from './Input.svelte';
import Select from './Select.svelte';
import Modal from './Modal.svelte';
import Checkbox from './Checkbox.svelte';
import Pagination from './Pagination.svelte';

describe('Ant Design server rendering', () => {
  it('renders the live showcase with labelled fields and a hidden modal without browser APIs', () => {
    const { body } = render(AntDesignShowcase);
    const labels = [...body.matchAll(/<label[^>]*for="([^"]+)"/g)];

    expect(body).toContain('Ant Design для Svelte');
    expect(body).toContain('54 компонента');
    expect(body).toContain('padding-inline:8px');
    expect(body).toContain('role="combobox"');
    expect(body).toContain('aria-expanded="false"');
    expect(body).toMatch(/<dialog[^>]*aria-labelledby="[^"]+"/);
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
    expect(labels.length).toBeGreaterThanOrEqual(7);

    for (const [, id] of labels) {
      expect(body).toContain(`id="${id}"`);
    }
  });

  it('escapes a user-provided input value in server-rendered HTML', () => {
    const { body } = render(Input, { props: { value: '"><script>alert(1)</script>', 'aria-label': 'Text' } });

    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).toContain('&quot;');
  });

  it('preserves a numeric zero as the selected value and the native form value', () => {
    const { body } = render(Select<number>, {
      props: { options: [{ value: 0, label: 'Zero' }], value: 0, name: 'count', 'aria-label': 'Count' }
    });

    expect(body).toContain('value="Zero"');
    expect(body).toMatch(/type="hidden"[^>]*name="count"[^>]*value="0"/);
  });

  it('keeps an initially open modal hidden until the browser can make it modal', () => {
    const children = createRawSnippet(() => ({ render: () => '<p>Details</p>' }));
    const { body } = render(Modal, { props: { title: 'Details', children, open: true } });

    expect(body).toContain('Details');
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
  });

  it('renders a mixed checkbox with its native form attributes before hydration', () => {
    const { body } = render(Checkbox, { props: { checked: true, indeterminate: true, name: 'choice', value: 'yes', 'aria-label': 'Choice' } });

    expect(body).toContain('type="checkbox"');
    expect(body).toContain('aria-checked="mixed"');
    expect(body).toMatch(/<input[^>]*\schecked(?:[\s=>])/);
    expect(body).toContain('name="choice"');
    expect(body).toContain('value="yes"');
  });

  it('renders an uncontrolled checked and disabled checkbox without browser APIs', () => {
    const { body } = render(Checkbox, { props: { defaultChecked: true, disabled: true, 'aria-label': 'Disabled choice' } });

    expect(body).toMatch(/<input[^>]*\schecked(?:[\s=>])/);
    expect(body).toMatch(/<input[^>]*\sdisabled(?:[\s=>])/);
  });

  it('renders a clamped pagination page without emitting user callbacks', () => {
    const events: number[] = [];
    const { body } = render(Pagination, { props: { total: 15, current: 99, onChange: (page) => events.push(page) } });

    expect(body).toMatch(/<button[^>]*aria-label="Страница 2"[^>]*aria-current="page"/);
    expect(body).toContain('aria-label="Пагинация"');
    expect(events).toEqual([]);
  });

  it('can hide pagination for an empty collection', () => {
    const { body } = render(Pagination, { props: { total: 0, hideOnSinglePage: true } });

    expect(body).not.toContain('<nav');
  });
});
