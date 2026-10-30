import { describe, expect, it } from 'vitest';
import {
  filterOptions,
  getEnabledIndex,
  getSelectValues,
  resolveSelectedOptions
} from './select.engine';

const options = [
  { value: 0, label: 'Svelte 5' },
  { value: 1, label: 'React', disabled: true },
  { value: 2, label: 'Vue' }
];

describe('getSelectValues', () => {
  it('deduplicates values in selection order while preserving primitive types', () => {
    expect(getSelectValues([0, '0', 2, 0, '0', 3])).toEqual([0, '0', 2, 3]);
  });

  it('copies readonly arrays and retains values missing from available options', () => {
    const input = Object.freeze([0, 99]);
    const result = getSelectValues(input);
    result.push(2);

    expect(input).toEqual([0, 99]);
    expect(result).toEqual([0, 99, 2]);
  });

  it('treats an absent selection as an empty array without coercing scalar values', () => {
    expect(getSelectValues(undefined)).toEqual([]);
    expect(getSelectValues(0)).toEqual([]);
    expect(getSelectValues('0')).toEqual([]);
  });
});

describe('filterOptions', () => {
  it('matches labels without changing numeric values or the source list', () => {
    const result = filterOptions(options, '  SVELTE  ');

    expect(result).toEqual([{ value: 0, label: 'Svelte 5' }]);
    expect(options).toHaveLength(3);
  });

  it('keeps disabled options visible in search results', () => {
    expect(filterOptions(options, 'react')).toEqual([options[1]]);
  });

  it('returns no options for an unmatched query', () => {
    expect(filterOptions(options, 'missing')).toEqual([]);
  });
});

describe('getEnabledIndex', () => {
  it('skips disabled options and wraps in both directions', () => {
    expect(getEnabledIndex(options, 0, 'next')).toBe(2);
    expect(getEnabledIndex(options, 2, 'next')).toBe(0);
    expect(getEnabledIndex(options, 2, 'previous')).toBe(0);
    expect(getEnabledIndex(options, 0, 'previous')).toBe(2);
  });

  it('finds the first or last enabled option without an active selection', () => {
    expect(getEnabledIndex(options, -1, 'first')).toBe(0);
    expect(getEnabledIndex(options, -1, 'last')).toBe(2);
    expect(getEnabledIndex(options, -1, 'previous')).toBe(2);
    expect(getEnabledIndex(options, 100, 'next')).toBe(0);
  });

  it('returns no active index for empty or entirely disabled options', () => {
    expect(getEnabledIndex([], -1, 'next')).toBe(-1);
    expect(getEnabledIndex([{ value: 'a', label: 'A', disabled: true }], 0, 'next')).toBe(-1);
  });
});


describe('remote Select options', () => {
  it(
    'bypasses filtering for remote results and supports a custom predicate without normalizing its query',
    () => {
      expect(filterOptions(options, 'unmatched', false)).toBe(options);
      expect(filterOptions(options, '2', (search, option) => String(option
        .value) === search))
        .toEqual(
          [options[2]]
        );
    }
  );
  it(
    'retains labels and disabled state only for selected values, refreshes labels and separates numeric keys',
    () => {
      const map = new Map<
        string | number,
        { value: string | number; label: string; disabled?: boolean; }
      >(
        [
          [0, { value: 0, label: 'Zero', disabled: true }],
          ['0', { value: '0', label: 'String zero' }]
        ]
      );
      const cached = resolveSelectedOptions([0, '0'], map, new Map());

      expect(resolveSelectedOptions([0, '0'], new Map(), cached)).toBe(cached);
      const replaced = resolveSelectedOptions(
        [0],
        new Map([[0, { value: 0, label: 'Renamed' }]]),
        cached
      );

      expect(replaced.size).toBe(1);
      expect(replaced.get(0)?.label).toBe('Renamed');
      expect(replaced.has('0')).toBe(false);
      expect(resolveSelectedOptions([99], new Map(), replaced).get(99)?.label).toBe('99');
    }
  );
});
