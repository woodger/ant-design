import { describe, expect, it } from 'vitest';
import { getRadioOptions } from './radio.engine';
import type { RadioValue } from './radio.types';

describe('getRadioOptions', () => {
  it('normalizes primitive options without coercing numeric or boolean values', () => {
    expect(getRadioOptions<RadioValue>([0, false, 'false'])).toEqual([
      { value: 0, label: '0' },
      { value: false, label: 'false' },
      { value: 'false', label: 'false' }
    ]);
  });

  it('keeps the first duplicate with its label and disabled state', () => {
    const first = { value: 0, label: 'First zero', disabled: true };

    expect(getRadioOptions([first, { value: 0, label: 'Second zero' }, 1])).toEqual(
      [first, { value: 1, label: '1' }]
    );
  });

  it(
    'keeps zero and false distinct from their string forms without mutating readonly input',
    () => {
      const options = Object.freeze([0, '0', false, 'false', 0]);
      const result = getRadioOptions<RadioValue>(options);

      expect(result.map((option) => option.value)).toEqual([0, '0', false, 'false']);
      expect(options).toEqual([0, '0', false, 'false', 0]);
    }
  );
});
