import { describe, it, expect } from 'vitest';
import {
  filterAutoCompleteOptions,
  flattenAutoCompleteOptions,
  autoCompleteNext
} from './auto-complete.engine';
import type { AutoCompleteItem } from './auto-complete.types';
const options: AutoCompleteItem[] = [
  {
    label: 'Team',
    options: [{ value: 'alpha', label: 'Other' }, { value: 'beta', disabled: true }]
  },
  { value: 'gamma' }
];
describe('AutoComplete source options', () => {
  it(
    'keeps unfiltered suggestions by default and filters values without trimming or accent folding',
    () => {
      expect(filterAutoCompleteOptions(options, 'missing')).toBe(options);
      expect(
        flattenAutoCompleteOptions(filterAutoCompleteOptions(options, 'ALP', true)).map(
          entry => entry.key
        )
      ).toEqual(
        ['group-0', 'alpha']
      );
      expect(filterAutoCompleteOptions(options, ' alp', true)).toEqual([]);
    }
  );
  it(
    'keeps a matching group whole and calls custom filters with original group and option data',
    () => {
      expect(filterAutoCompleteOptions(options, 'team', true)).toEqual([options[0]]);
      expect(filterAutoCompleteOptions(options, 'Other', (text, item) => item
        .label === text))
        .toEqual(
          [{ label: 'Team', options: [{ value: 'alpha', label: 'Other' }] }]
        );
    }
  );
  it('skips group headers and disabled options and wraps in either direction', () => {
    const entries = flattenAutoCompleteOptions(options);

    expect(autoCompleteNext(entries, -1, 1)).toBe(1);
    expect(autoCompleteNext(entries, 1, 1)).toBe(3);
    expect(autoCompleteNext(entries, 1, -1)).toBe(3);
    expect(autoCompleteNext([], -1, 1)).toBe(-1);
  });
});
