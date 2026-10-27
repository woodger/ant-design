import { describe, expect, it } from 'vitest';
import { getTabsActiveKey, getTabsNavigationKey, getTabsPlacement, normalizeTabsItems } from './tabs.engine';
import type { TabsItem } from './tabs.types';

const items: TabsItem[] = [{ key: '', label: 'Alpha' }, { key: 'disabled', label: 'Unavailable', disabled: true }, { key: 'beta', label: 'Beta' }, { key: 'gamma', label: 'Gamma' }];

describe('Tabs item normalization', () => {
  it('keeps the first duplicate, including its disabled state, without changing the source', () => {
    const source = Object.freeze([...items, { key: '', label: 'Duplicate' }, { key: 'disabled', label: 'Enabled duplicate' }]);

    expect(normalizeTabsItems(source)).toEqual(items);
    expect(source).toHaveLength(6);
  });

  it('uses the requested eligible key, including the empty string', () => {
    expect(getTabsActiveKey(items, 'beta')).toBe('beta');
    expect(getTabsActiveKey(items, '')).toBe('');
  });

  it('falls back to the first available tab after removal, disabling or a missing default', () => {
    expect(getTabsActiveKey(items, 'missing')).toBe('');
    expect(getTabsActiveKey(items, 'disabled')).toBe('');
    expect(getTabsActiveKey(items.slice(1), '')).toBe('beta');
    expect(getTabsActiveKey(items, undefined)).toBe('');
  });

  it('selects nothing when the list is empty or entirely disabled', () => {
    expect(getTabsActiveKey([], 'beta')).toBeUndefined();
    expect(getTabsActiveKey(items.map((item) => ({ ...item, disabled: true })), '')).toBeUndefined();
  });
});

describe('Tabs keyboard navigation', () => {
  it('wraps through enabled tabs without changing selection or the input list', () => {
    expect(getTabsNavigationKey(items, '', 'next')).toBe('beta');
    expect(getTabsNavigationKey(items, '', 'previous')).toBe('gamma');
    expect(getTabsNavigationKey(items, 'gamma', 'next')).toBe('');
    expect(items[1].disabled).toBe(true);
  });

  it('supports Home and End independently of the focused tab', () => {
    expect(getTabsNavigationKey(items, 'beta', 'first')).toBe('');
    expect(getTabsNavigationKey(items, '', 'last')).toBe('gamma');
  });

  it('starts from the appropriate edge when focus has no matching key', () => {
    expect(getTabsNavigationKey(items, 'removed', 'next')).toBe('');
    expect(getTabsNavigationKey(items, undefined, 'previous')).toBe('gamma');
    expect(getTabsNavigationKey([{ key: 'only', label: 'Only' }], 'only', 'next')).toBe('only');
  });

  it('returns no target when no enabled tab exists', () => {
    expect(getTabsNavigationKey([], undefined, 'first')).toBeUndefined();
    expect(getTabsNavigationKey([{ key: 'locked', label: 'Locked', disabled: true }], 'locked', 'next')).toBeUndefined();
  });
});

describe('Tabs placement', () => {
  it.each([['start', 'ltr', 'left'], ['end', 'ltr', 'right'], ['start', 'rtl', 'right'], ['end', 'rtl', 'left']] as const)('maps %s in %s to physical %s', (placement, direction, expected) => {
    expect(getTabsPlacement(placement, direction)).toBe(expected);
  });

  it('preserves horizontal placements and switches vertical tabs to the top on narrow screens', () => {
    expect(getTabsPlacement('top', 'rtl', true)).toBe('top');
    expect(getTabsPlacement('bottom', 'ltr', true)).toBe('bottom');
    expect(getTabsPlacement('start', 'rtl', true)).toBe('top');
    expect(getTabsPlacement('end', 'ltr', true)).toBe('top');
  });
});
