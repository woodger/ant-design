import { describe, expect, it } from 'vitest';
import { getPaginationItems, getPaginationState, getPageSizeOptions } from './pagination.engine';

describe('getPaginationState', () => {
  it('represents an empty collection as page one with an empty range', () => {
    expect(getPaginationState(0, 99, 10)).toEqual({ total: 0, current: 1, pageSize: 10, pageCount: 1, range: [0, 0] });
  });

  it('clamps the current page when the collection shrinks', () => {
    expect(getPaginationState(21, 8, 10)).toEqual({ total: 21, current: 3, pageSize: 10, pageCount: 3, range: [21, 21] });
  });

  it('keeps the current page within the range after changing page size', () => {
    expect(getPaginationState(95, 8, 50)).toEqual({ total: 95, current: 2, pageSize: 50, pageCount: 2, range: [51, 95] });
  });

  it('normalizes non-finite, negative and zero values without division by zero', () => {
    expect(getPaginationState(Number.NaN, Number.POSITIVE_INFINITY, Number.NaN)).toEqual({ total: 0, current: 1, pageSize: 10, pageCount: 1, range: [0, 0] });
    expect(getPaginationState(-10, -5, 0)).toEqual({ total: 0, current: 1, pageSize: 1, pageCount: 1, range: [0, 0] });
  });

  it('uses whole records, pages and page sizes for fractional input', () => {
    expect(getPaginationState(101.9, 3.9, 20.9)).toEqual({ total: 101, current: 3, pageSize: 20, pageCount: 6, range: [41, 60] });
  });

  it('keeps the last record in the safe integer range', () => {
    const state = getPaginationState(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1);

    expect(state.range).toEqual([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]);
    expect(state.current).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('getPaginationItems', () => {
  it('shows every page in a small collection', () => {
    expect(getPaginationItems(getPaginationState(70, 4, 10))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows the first pages and a forward jump at the start', () => {
    expect(getPaginationItems(getPaginationState(200, 1, 10))).toEqual([1, 2, 3, 4, 5, 'jump-next', 20]);
  });

  it('shows the current page, its neighbours and both jumps in the middle', () => {
    expect(getPaginationItems(getPaginationState(200, 10, 10))).toEqual([1, 'jump-prev', 8, 9, 10, 11, 12, 'jump-next', 20]);
  });

  it('shows the last pages and a backward jump at the end', () => {
    expect(getPaginationItems(getPaginationState(200, 20, 10))).toEqual([1, 'jump-prev', 16, 17, 18, 19, 20]);
  });

  it('shows a single missing page instead of a jump near either edge', () => {
    expect(getPaginationItems(getPaginationState(100, 5, 10))).toEqual([1, 2, 3, 4, 5, 6, 7, 'jump-next', 10]);
    expect(getPaginationItems(getPaginationState(100, 6, 10))).toEqual([1, 'jump-prev', 4, 5, 6, 7, 8, 9, 10]);
  });

  it('keeps rendering bounded for a very large page count', () => {
    const items = getPaginationItems(getPaginationState(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1));

    expect(items).toHaveLength(7);
    expect(items[0]).toBe(1);
    expect(items.at(-1)).toBe(Number.MAX_SAFE_INTEGER);
    expect(new Set(items).size).toBe(items.length);
  });
});

describe('getPageSizeOptions', () => {
  it('sorts unique valid sizes and includes a custom selected size', () => {
    expect(getPageSizeOptions([20, 10, 20, 0, -5, 2.5, Number.NaN, Number.POSITIVE_INFINITY], 15)).toEqual([10, 15, 20]);
  });
});
