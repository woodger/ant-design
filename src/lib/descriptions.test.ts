import { describe, expect, it } from 'vitest';
import { descriptionsColumn, descriptionsItems, descriptionsRows } from './descriptions.engine';
import type { DescriptionsItem } from './descriptions.types';

describe('Descriptions responsive layout', () => {
  it('uses three columns for SSR and mobile-first cumulative breakpoints after connection', () => {
    expect(descriptionsColumn(undefined, {})).toBe(3);
    expect(descriptionsColumn(undefined, { xs: true })).toBe(1);
    expect(descriptionsColumn(undefined, { sm: true })).toBe(2);
    expect(descriptionsColumn(undefined, { xxxl: true, xxl: true })).toBe(4);
    expect(descriptionsColumn({ md: 2 }, { lg: true, md: true, sm: true })).toBe(2);
    expect(descriptionsColumn({ xl: 4 }, { md: true, sm: true })).toBe(3);
    expect(descriptionsColumn(Number.NaN, {})).toBe(3);
    expect(descriptionsColumn(6, { xs: true })).toBe(6);
  });
  it('fills incomplete rows and clips overflowing spans without mutating input', () => {
    const items = Object.freeze([Object.freeze({ key: 'a', span: 2 }), Object.freeze({ key: 'b', span: 5 }), Object.freeze({ key: 'c' })] as const);
    const rows = descriptionsRows(items, 3, {});

    expect(rows.map(row => row.map(item => [item.key, item.span]))).toEqual([[['a', 2], ['b', 1]], [['c', 3]]]);
    expect(items[1].span).toBe(5);
    expect(descriptionsRows([{ span: 1 }, { span: 2 }], 6, {}).map(row => row.map(item => item.span))).toEqual([[1, 5]]);
  });
  it('ends each filled row and expands its last item to the remaining columns', () => {
    const spans: DescriptionsItem['span'][] = [2, undefined, undefined, 'filled', 'filled', undefined, 1];
    const rows = descriptionsRows(spans.map(span => ({ span })), 3, {});

    expect(rows.map(row => row.map(item => item.span ?? 1))).toEqual([[2, 1], [1, 2], [3], [1, 2]]);
    expect(rows.flat().some(item => item.filled)).toBe(false);
  });
  it('resolves responsive spans with no SSR matches and preserves zero spans from the reference', () => {
    const items: DescriptionsItem[] = [{ span: { xs: 1, md: 2 } }, { span: 'filled' }];

    expect(descriptionsItems(items, {})).toEqual([{ span: undefined }, { filled: true }]);
    expect(descriptionsRows(items, 3, { lg: true, md: true }).map(row => row.map(item => item.span ?? 1))).toEqual([[2, 1]]);
    expect(descriptionsRows([{ span: 0 }, { span: 2 }], 3, {})).toEqual([[{ span: 0 }, { span: 2 }]]);
    expect(descriptionsRows([], 3, {})).toEqual([]);
  });
});
