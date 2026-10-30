import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Radio from './Radio.svelte';
import RadioGroup from './RadioGroup.svelte';
import type { RadioGroupProps, RadioValue } from './radio.types';

const options = [
  { value: 0, label: 'Zero' },
  { value: 1, label: 'Locked', disabled: true },
  { value: 2, label: 'Two' }
];

describe('Radio server rendering', () => {
  it('renders a named native radio with its default and snippet before hydration', () => {
    const children = createRawSnippet(() => ({ render: () => '<span>Accept</span>' }));
    const { body } = render(
      Radio,
      { props: { name: 'accepted', value: false, defaultChecked: true, children } }
    );

    expect(body).toContain('type="radio"');
    expect(body).toContain('name="accepted"');
    expect(body).toContain('value="false"');
    expect(body).toMatch(/<input[^>]*\schecked(?:[\s=>])/);
    expect(body).toContain('aria-checked="true"');
    expect(body).toContain('<span>Accept</span>');
  });

  it(
    'uses an explicit false checked value instead of defaults and renders disabled state',
    () => {
      const { body } = render(
        Radio,
        {
          props: {
            checked: false,
            defaultChecked: true,
            disabled: true,
            'aria-label': 'Disabled'
          }
        }
      );

      expect(body).toContain('aria-checked="false"');
      expect(body).toMatch(/<input[^>]*\sdisabled(?:[\s=>])/);
      expect(body).toContain('ant-radio-wrapper-disabled');
    }
  );
});

describe('RadioGroup server rendering', () => {
  it(
    'renders one numeric native selection under a shared name with a typed value callback',
    () => {
      const { body } = render(
        RadioGroup<number>,
        { props: { options, value: 0, name: 'role', 'aria-label': 'Roles', required: true } }
      );
      const inputs = body.match(/<input\b[^>]*>/g) ?? [];

      expect(body).toContain('role="radiogroup"');
      expect(body).toContain('aria-required="true"');
      expect(inputs).toHaveLength(3);
      expect(inputs.every((input) => input.includes('type="radio"')
        && input.includes('name="role"'))).toBe(
          true
        );
      expect(inputs.filter((input) => /\schecked(?:[\s=>])/.test(input))).toHaveLength(1);
      expect(inputs[0]).toContain('aria-checked="true"');
      expectTypeOf<NonNullable<RadioGroupProps<number>['onValueChange']>>()
        .parameter(0)
        .toEqualTypeOf<
          number
        >();
      expectTypeOf<RadioGroupProps<boolean>['value']>().toEqualTypeOf<boolean | undefined>();
    }
  );

  it('preserves boolean false separately from its string form', () => {
    const { body } = render(
      RadioGroup<RadioValue>,
      {
        props: {
          options: [{ value: false, label: 'Boolean' }, { value: 'false', label: 'Text' }],
          value: false
        }
      }
    );
    const inputs = body.match(/<input\b[^>]*>/g) ?? [];

    expect(inputs[0]).toContain('aria-checked="true"');
    expect(inputs[1]).toContain('aria-checked="false"');
    expect(inputs.every((input) => input.includes('value="false"'))).toBe(true);
  });

  it('uses a stable default without calling callbacks or changing caller options', () => {
    const frozen = Object.freeze([0, 2]);
    const { body } = render(RadioGroup<number>, {
      props: {
        options: frozen,
        defaultValue: 2,
        onValueChange: () => {
          throw new Error('Unexpected value callback');
        }
      }
    });

    expect(body).toMatch(/value="2"[^>]*aria-checked="true"/);
    expect(frozen).toEqual([0, 2]);
  });

  it('keeps unavailable values unselected without adding synthetic native fields', () => {
    const { body } = render(RadioGroup<number>, { props: { options, value: 99, name: 'role' } });

    expect(body).not.toContain('aria-checked="true"');
    expect(body).not.toContain('value="99"');
    expect(body).not.toContain('type="hidden"');
  });

  it('disables every option with its group and gives each control a unique id', () => {
    const { body } = render(
      RadioGroup<number>,
      { props: { id: 'roles', options, disabled: true, orientation: 'vertical' } }
    );
    const inputs = body.match(/<input\b[^>]*>/g) ?? [];

    expect(inputs.every((input) => /\sdisabled(?:[\s=>])/.test(input))).toBe(true);
    expect([...body.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])).toEqual(
      ['roles', 'roles-0', 'roles-1', 'roles-2']
    );
    expect(body).toContain('aria-orientation="vertical"');
    expect(body).toContain('ant-radio-group-vertical');
  });

  it('deduplicates options and escapes labels in native names and visible content', () => {
    const { body } = render(
      RadioGroup<string>,
      { props: { options: [{ value: 'x', label: '<script>alert(1)</script>' }, 'x'] } }
    );

    expect(body.match(/type="radio"/g)).toHaveLength(1);
    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).toContain('&lt;script>');
  });
});
