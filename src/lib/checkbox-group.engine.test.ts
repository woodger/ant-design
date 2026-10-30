import { describe, expect, it } from 'vitest';
import { getCheckboxGroupOptions, getCheckboxGroupValue } from './checkbox-group.engine';
import type { CheckboxGroupOption, CheckboxGroupValue } from './checkbox-group.types';

describe('getCheckboxGroupOptions', () => {
  it('normalizes primitive options while preserving typed values and disabled choices', () => {
    const locked = { value: 'locked', label: 'Locked', disabled: true };
    const options = Object.freeze([0, false, 'zero', locked]);

    expect(getCheckboxGroupOptions<CheckboxGroupValue>(options)).toEqual([
      { value: 0, label: '0' },
      { value: false, label: 'false' },
      { value: 'zero', label: 'zero' },
      locked
    ]);
    expect(options).toEqual([0, false, 'zero', locked]);
  });

  it('keeps the first duplicate without conflating zero or false with strings', () => {
    const result = getCheckboxGroupOptions<CheckboxGroupValue>(
      [0, '0', false, 'false', { value: 0, label: 'Duplicate zero' }, false]
    );

    expect(result.map((option) => option.value)).toEqual([0, '0', false, 'false']);
    expect(result[0].label).toBe('0');
  });
});

describe('getCheckboxGroupValue', () => {
  const options: CheckboxGroupOption<number>[] = [
    { value: 0, label: 'Zero' },
    { value: 1, label: 'Locked', disabled: true },
    { value: 2, label: 'Two' }
  ];

  it('returns current choices in option order and retains selected disabled values', () => {
    expect(getCheckboxGroupValue(options, [2, 99, 1, 0, 2])).toEqual([0, 1, 2]);
    expect(getCheckboxGroupValue([], [0])).toEqual([]);
  });

  it('does not mutate or alias readonly owner values', () => {
    const value = Object.freeze([2, 0, 2]);
    const result = getCheckboxGroupValue(options, value);
    result.push(1);

    expect(value).toEqual([2, 0, 2]);
    expect(result).toEqual([0, 2, 1]);
  });
});
