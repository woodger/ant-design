import { describe, expect, it } from 'vitest';
import { compactClasses, compactEntries } from './space-compact.engine';

describe('Compact context classes', () => {
  it('keeps controls outside Compact unchanged and applies both edge classes to a single item', () => {
    expect(compactClasses('ant-input', 'ltr', null)).toBe('');
    expect(compactClasses('ant-input', 'ltr', { orientation: 'horizontal', first: true, last: true })).toBe('ant-input-compact-item ant-input-compact-first-item ant-input-compact-last-item');
  });
  it('distinguishes vertical edges and RTL without inventing horizontal classes for them', () => {
    expect(compactClasses('ant-btn', 'rtl', { orientation: 'vertical', first: false, last: true })).toBe('ant-btn-compact-vertical-item ant-btn-compact-vertical-last-item ant-btn-compact-vertical-item-rtl');
  });
  it('filters React-normalized booleans and null values but keeps empty strings and zero as source child positions', () => {
    expect(compactEntries([null, true, false, undefined, '', 0, { key: 'a', children: 'A' }]).map(item => item.children)).toEqual(['', 0, 'A']);
    expect(compactEntries([])).toEqual([]);
  });
});
