import { describe, expect, it } from 'vitest';
import {
  equalMasonryData,
  getMasonryColumns,
  getMasonryPositions,
  mergeMasonryEntries,
  type MasonryEntry
} from './masonry.engine';

describe('getMasonryColumns', () => {
  it('keeps default and responsive fallbacks before a matching breakpoint exists', () => {
    expect(getMasonryColumns(undefined, {})).toBe(3);
    expect(getMasonryColumns(0, {})).toBe(3);
    expect(getMasonryColumns(NaN, {})).toBe(3);
    expect(getMasonryColumns({ sm: 2 }, {})).toBe(1);
    expect(getMasonryColumns({ xs: 2, md: 4 }, {})).toBe(2);
  });

  it('selects the largest active breakpoint including xxxl without rounding numbers', () => {
    expect(getMasonryColumns({ xs: 1, sm: 2, md: 3 }, { xs: false, sm: true, md: true }))
      .toBe(3);
    expect(getMasonryColumns({ xs: 1, xxxl: 6 }, { xl: true, xxxl: true })).toBe(6);
    expect(getMasonryColumns(2.5, {})).toBe(2.5);
  });
});

describe('getMasonryPositions', () => {
  it('fills the shortest columns in source order and breaks ties by the first column', () => {
    const layout = getMasonryPositions([
      ['a', 20], ['b', 10], ['c', 30], ['d', 40], ['e', 10]
    ], 3, 0);

    expect([...layout.positions]).toEqual([
      ['a', { column: 0, top: 0 }],
      ['b', { column: 1, top: 0 }],
      ['c', { column: 2, top: 0 }],
      ['d', { column: 1, top: 10 }],
      ['e', { column: 0, top: 20 }]
    ]);
    expect(layout.height).toBe(50);
  });

  it('rearranges later elements after measured heights change', () => {
    const layout = getMasonryPositions([
      ['a', 20], ['b', 50], ['c', 30], ['d', 40], ['e', 10]
    ], 3, 0);

    expect([...layout.positions.values()].map(position => position.column))
      .toEqual([0, 1, 2, 0, 2]);
    expect(layout.positions.get('d')?.top).toBe(20);
    expect(layout.height).toBe(60);
  });

  it('reserves vertical gaps only between items and keeps fractional measured sizes', () => {
    const layout = getMasonryPositions([['a', 10.5], ['b', 20], ['c', 4.25]], 2, 8);

    expect(layout.positions.get('c')).toEqual({ column: 0, top: 18.5 });
    expect(layout.height).toBe(22.75);
    expect(getMasonryPositions([], 3, 8).height).toBe(0);
    expect(getMasonryPositions([['a', 0]], 2, 0).height).toBe(0);
  });

  it('honors explicit columns and only clamps their upper bound', () => {
    const layout = getMasonryPositions([['a', 30, 10], ['b', 20, 1], ['c', 10]], 3, 4);

    expect(layout.positions.get('a')).toEqual({ column: 2, top: 0 });
    expect(layout.positions.get('b')).toEqual({ column: 1, top: 0 });
    expect(layout.positions.get('c')).toEqual({ column: 0, top: 0 });
    expect(layout.height).toBe(30);
    expect(getMasonryPositions([['a', 10, -1]], 2, 0).positions.get('a'))
      .toEqual({ column: -1, top: undefined });
  });

  it('keeps numeric and string item keys distinct in geometry', () => {
    const layout = getMasonryPositions([[1, 10], ['1', 20]], 2, 0);

    expect(layout.positions.get(1)).toEqual({ column: 0, top: 0 });
    expect(layout.positions.get('1')).toEqual({ column: 1, top: 0 });
  });

  it('preserves the source RangeError for invalid non-default column counts', () => {
    expect(() => getMasonryPositions([], -1, 0)).toThrow(RangeError);
    expect(() => getMasonryPositions([], 2.5, 0)).toThrow(RangeError);
    expect(() => getMasonryPositions([], Infinity, 0)).toThrow(RangeError);
  });
});

describe('mergeMasonryEntries', () => {
  const entry = (key: string, data = key): MasonryEntry<string> => ({
    key,
    itemKey: key,
    item: { key, data },
    index: 0,
    visible: true
  });

  it('keeps leaving elements between their surviving neighbors with the old payload', () => {
    const previous = [entry('a'), entry('b', 'retained'), entry('c')];

    const merged = mergeMasonryEntries(previous, [entry('a'), entry('c')]);

    expect(merged.map(value => [value.key, value.visible, value.item.data]))
      .toEqual([['a', true, 'a'], ['b', false, 'retained'], ['c', true, 'c']]);
    expect(previous[1].visible).toBe(true);
  });

  it('reorders surviving keyed nodes without leaving duplicate old entries', () => {
    const result = mergeMasonryEntries(
      [entry('a'), entry('b'), entry('c')],
      [entry('c'), entry('a', 'updated'), entry('b')]
    );

    expect(result.map(value => value.key)).toEqual(['c', 'a', 'b']);
    expect(result.every(value => value.visible)).toBe(true);
    expect(result[1].item.data).toBe('updated');
  });

  it('revives a leaving key and appends new keys after the existing order', () => {
    const previous = [{ ...entry('a'), visible: false }, entry('b')];

    const result = mergeMasonryEntries(previous, [entry('a', 'returned'), entry('b'), entry('c')]);

    expect(result.map(value => [value.key, value.visible]))
      .toEqual([['a', true], ['b', true], ['c', true]]);
    expect(result[0].item.data).toBe('returned');
  });
});

describe('equalMasonryData', () => {
  it('avoids redundant layout notifications for equivalent items while detecting new data', () => {
    expect(equalMasonryData([[{ key: 'a', data: { height: 20 } }, 1]], [
      [{ key: 'a', data: { height: 20 } }, 1]
    ])).toBe(true);
    expect(equalMasonryData([[{ key: 'a', data: 20 }, 1]], [[{ key: 'a', data: 30 }, 1]]))
      .toBe(false);
    expect(equalMasonryData([[{ key: 'a', data: 20 }, 1]], [[{ key: 'a', data: 20 }, 0]]))
      .toBe(false);
  });

  it('keeps the upstream repeated-reference and NaN comparison conventions', () => {
    const shared = { height: 10 };
    const left: { self?: unknown } = {};
    const right: { self?: unknown } = {};
    left.self = left;
    right.self = right;

    expect(equalMasonryData([shared, shared], [{ height: 10 }, { height: 10 }])).toBe(false);
    expect(equalMasonryData(left, right)).toBe(false);
    expect(equalMasonryData(NaN, NaN)).toBe(false);
    expect(equalMasonryData(shared, shared)).toBe(true);
  });
});
