import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import CheckboxGroup from './CheckboxGroup.svelte';
import type { CheckboxGroupProps, CheckboxGroupValue } from './checkbox-group.types';

describe('CheckboxGroup server rendering', () => {
  it('renders native checkboxes with typed zero and false selections before hydration', () => {
    const { body } = render(CheckboxGroup<CheckboxGroupValue>, { props: {
      options: [{ value: 0, label: 'Zero' }, { value: false, label: 'False' }, { value: 'next', label: 'Next' }],
      value: [false, 0], name: 'choices', 'aria-label': 'Choices'
    } });
    const inputs = body.match(/<input\b[^>]*>/g) ?? [];

    expect(body).toContain('<fieldset');
    expect(body).toContain('aria-label="Choices"');
    expect(inputs).toHaveLength(3);
    expect(inputs.filter((input) => /aria-checked="true"/.test(input))).toHaveLength(2);
    expect(inputs.filter((input) => /\schecked(?:[\s=>])/.test(input))).toHaveLength(2);
    expect(inputs.every((input) => input.includes('type="checkbox"') && input.includes('name="choices"'))).toBe(true);
    expect(inputs[0]).toContain('value="0"');
    expect(inputs[1]).toContain('value="false"');
    expect(body).not.toContain('type="hidden"');
    expectTypeOf<NonNullable<CheckboxGroupProps<number>['onValueChange']>>().parameter(0).toEqualTypeOf<number[]>();
  });

  it('uses readonly defaults without changing the owner or emitting callbacks', () => {
    const defaults = Object.freeze([0, 0, 2]);
    const { body } = render(CheckboxGroup<number>, { props: {
      options: [0, 2, 3], defaultValue: defaults,
      onValueChange: () => { throw new Error('Unexpected change'); }
    } });

    expect(body.match(/aria-checked="true"/g)).toHaveLength(2);
    expect(defaults).toEqual([0, 0, 2]);
  });

  it('uses an explicit empty selection instead of defaults and ignores unavailable values in the DOM', () => {
    const { body } = render(CheckboxGroup<number>, { props: { options: [0, 2], value: [], defaultValue: [0] } });
    const missing = render(CheckboxGroup<number>, { props: { options: [0], value: [99] } }).body;

    expect(body).not.toContain('aria-checked="true"');
    expect(missing).not.toContain('value="99"');
    expect(missing).toContain('aria-checked="false"');
  });

  it('disables every native input when the group is disabled including explicitly enabled options', () => {
    const { body } = render(CheckboxGroup<number>, { props: {
      options: [{ value: 0, label: 'Zero', disabled: false }, { value: 1, label: 'One' }], value: [0], disabled: true
    } });
    const inputs = body.match(/<input\b[^>]*>/g) ?? [];

    expect(inputs).toHaveLength(2);
    expect(inputs.every((input) => /\sdisabled(?:[\s=>])/.test(input))).toBe(true);
    expect(body).toContain('ant-checkbox-wrapper-disabled');
  });

  it('deduplicates options and gives the fieldset and each native input a unique id while escaping labels', () => {
    const { body } = render(CheckboxGroup<string>, { props: {
      id: 'choices', options: [{ value: 'x', label: '<script>alert(1)</script>' }, 'x', 'y']
    } });
    const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

    expect(ids).toEqual(['choices', 'choices-0', 'choices-1']);
    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).toContain('&lt;script>');
  });

  it('keeps an empty group named and programmatically focusable without a browser', () => {
    const { body } = render(CheckboxGroup, { props: { options: [], 'aria-label': 'Empty choices' } });

    expect(body).toContain('aria-label="Empty choices"');
    expect(body).toContain('tabindex="-1"');
    expect(body).not.toContain('<input');
  });
});
