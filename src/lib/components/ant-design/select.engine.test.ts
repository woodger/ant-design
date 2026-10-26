import { describe, expect, it } from 'vitest';
import { filterOptions, getEnabledIndex } from './select.engine';

const options = [
  { value: 0, label: 'Svelte 5' },
  { value: 1, label: 'React', disabled: true },
  { value: 2, label: 'Vue' }
];

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
