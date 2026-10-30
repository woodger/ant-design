import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Select from './Select.svelte';
import type { SelectProps } from './select.types';

const options = [
  { value: 0, label: 'Zero' },
  { value: 1, label: 'Locked', disabled: true },
  { value: 2, label: 'Two' }
];

describe('Multiple Select server rendering', () => {
  it(
    'renders numeric chips and one native field per selected value with mode-specific callback types',
    () => {
      const { body } = render(
        Select<number, 'multiple'>,
        {
          props: {
            mode: 'multiple',
            options,
            value: [0, 2],
            name: 'counts',
            'aria-label': 'Counts',
            allowClear: true
          }
        }
      );

      expect(body).toContain('ant-select-multiple');
      expect(body).toContain('aria-label="Удалить Zero"');
      expect(body).toContain('aria-label="Удалить Two"');
      expect(
        [...body.matchAll(/type="hidden"[^>]*name="counts"[^>]*value="([^"]*)"/g)].map(
          (match) => match[1]
        )
      ).toEqual(
        ['0', '2']
      );
      expect(body).toMatch(/role="combobox"[^>]*value=""/);
      expectTypeOf<NonNullable<SelectProps<number>['onValueChange']>>().parameter(0).toEqualTypeOf<
        number | undefined
      >();
      expectTypeOf<NonNullable<SelectProps<number, 'multiple'>['onValueChange']>>()
        .parameter(0)
        .toEqualTypeOf<
          number[]
        >();
      expectTypeOf<SelectProps<number, 'multiple'>['value']>().toEqualTypeOf<
        number[]
        | undefined
      >();
    }
  );

  it('normalizes readonly defaults without changing the input or notifying its owner', () => {
    const defaults = Object.freeze([0, 2, 0]);
    const { body } = render(Select<number, 'multiple'>, {
      props: {
        mode: 'multiple',
        options,
        defaultValue: defaults,
        name: 'counts',
        onValueChange: () => {
          throw new Error('Unexpected value callback');
        },
        onOpenChange: () => {
          throw new Error('Unexpected open callback');
        }
      }
    });

    expect(body.match(/type="hidden"/g)).toHaveLength(2);
    expect(body).toContain('aria-label="Удалить Zero"');
    expect(defaults).toEqual([0, 2, 0]);
  });

  it(
    'uses an explicit empty array instead of defaults and omits native selected fields',
    () => {
      const { body } = render(
        Select<number, 'multiple'>,
        {
          props: {
            mode: 'multiple',
            options,
            value: [],
            defaultValue: [0],
            name: 'counts',
            placeholder: 'Choose counts'
          }
        }
      );

      expect(body).not.toContain('type="hidden"');
      expect(body).not.toContain('ant-select-selection-item-content');
      expect(body).toContain('placeholder="Choose counts"');
    }
  );

  it(
    'keeps unavailable selected values visible and serializes them without local data loss',
    () => {
      const { body } = render(
        Select<number, 'multiple'>,
        { props: { mode: 'multiple', options, value: [99, 0], name: 'counts' } }
      );

      expect(body).toContain('aria-label="Удалить 99"');
      expect(body).toMatch(/type="hidden"[^>]*value="99"/);
      expect(body).toMatch(/type="hidden"[^>]*value="0"/);
    }
  );

  it(
    'prevents removal of disabled items and disables all native selected fields with the component',
    () => {
      const { body } = render(
        Select<number, 'multiple'>,
        { props: { mode: 'multiple', options, value: [0, 1], name: 'counts' } }
      );

      expect(body).toContain('aria-label="Удалить Zero"');
      expect(body).not.toContain('aria-label="Удалить Locked"');

      const disabled = render(
        Select<number, 'multiple'>,
        { props: { mode: 'multiple', options, value: [0, 2], name: 'counts', disabled: true } }
      ).body;
      const fields = disabled.match(/<input\b[^>]*type="hidden"[^>]*>/g) ?? [];

      expect(fields).toHaveLength(2);
      expect(fields.every((field) => /\sdisabled(?:[\s=>])/.test(field))).toBe(true);
      expect(disabled).not.toContain('ant-select-selection-item-remove');
    }
  );

  it('escapes option labels in chip content and accessible button names', () => {
    const { body } = render(
      Select<string, 'multiple'>,
      {
        props: {
          mode: 'multiple',
          options: [{ value: 'x', label: '<script>alert(1)</script>' }],
          value: ['x']
        }
      }
    );

    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).toContain('&lt;script>');
  });
});
