import { describe, expect, it } from 'vitest';
import { normalizeSegmentedOptions, offsetSegmentedValue } from './segmented.engine';

describe('Segmented options and keyboard selection', () => {
  it('preserves numeric zero and string values and derives native scalar titles', () => {
    expect(
      normalizeSegmentedOptions<string | number>(
        [0, '0', { value: 'week', label: 'Weekly', disabled: true }]
      )
    ).toEqual(
      [
        { value: 0, label: '0', title: '0' },
        { value: '0', label: '0', title: '0' },
        { value: 'week', label: 'Weekly', title: 'Weekly', disabled: true }
      ]
    );
  });
  it('retains explicit empty titles and follows upstream icon title handling', () => {
    const icon = () => {
      throw new Error('must not render');
    };

    expect(normalizeSegmentedOptions([{ value: 0, label: 'Zero', title: '' }])[0].title).toBe('');
    expect(normalizeSegmentedOptions([{ value: 0, label: 'Zero', icon }])[0].title).toBeUndefined();
  });
  it(
    'cycles in source order while skipping disabled options and keeping a disabled current value',
    () => {
      const options = normalizeSegmentedOptions([0, { value: 1, disabled: true }, 2]);

      expect(offsetSegmentedValue(options, 0, 1)).toBe(2);
      expect(offsetSegmentedValue(options, 2, 1)).toBe(0);
      expect(offsetSegmentedValue(options, 0, -1)).toBe(2);
      expect(offsetSegmentedValue(options, 1, 1)).toBe(2);
    }
  );
  it(
    'preserves upstream missing-selection arithmetic and returns no value for empty options',
    () => {
      const options = normalizeSegmentedOptions(['first', 'second', 'third']);

      expect(offsetSegmentedValue(options, 'missing', 1)).toBe('first');
      expect(offsetSegmentedValue(options, 'missing', -1)).toBe('second');
      expect(offsetSegmentedValue([], undefined, 1)).toBeUndefined();
    }
  );
});
