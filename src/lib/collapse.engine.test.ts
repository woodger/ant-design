import { describe, expect, it } from 'vitest';
import { getCollapseFocusKey, getCollapseKeys, getCollapseTrigger, normalizeCollapseItems, toggleCollapseKey } from './collapse.engine';
import type { CollapseItem } from './collapse.types';

const items: CollapseItem[] = [{ key: '', label: 'Profile' }, { key: 'locked', label: 'Locked', collapsible: 'disabled' }, { key: 'settings', label: 'Settings' }];

describe('Collapse items and values', () => {
  it('preserves the first item for each key without changing readonly input', () => {
    const source = Object.freeze([...items.map((item) => Object.freeze({ ...item })), Object.freeze({ key: '', label: 'Duplicate' })]);

    expect(normalizeCollapseItems(source)).toEqual(items);
    expect(source).toHaveLength(4);
  });

  it('normalizes a scalar or readonly array, preserving empty and unknown keys', () => {
    const source = Object.freeze(['', 'missing', '', 'settings']);

    expect(getCollapseKeys(source)).toEqual(['', 'missing', 'settings']);
    expect(getCollapseKeys('')).toEqual(['']);
    expect(getCollapseKeys(undefined)).toEqual([]);
    expect(source).toEqual(['', 'missing', '', 'settings']);
  });

  it('uses only the first requested key in accordion mode and defaults to closed', () => {
    expect(getCollapseKeys(['missing', 'settings'], true)).toEqual(['missing']);
    expect(getCollapseKeys(undefined, true)).toEqual([]);
  });

  it('toggles independent panels in activation order and retains unavailable keys', () => {
    const source = Object.freeze(['missing', '']);

    expect(toggleCollapseKey(source, 'settings')).toEqual(['missing', '', 'settings']);
    expect(toggleCollapseKey(source, '')).toEqual(['missing']);
    expect(source).toEqual(['missing', '']);
  });

  it('opens at most one accordion panel and permits closing the last panel', () => {
    expect(toggleCollapseKey(['', 'settings'], 'settings', true)).toEqual(['settings']);
    expect(toggleCollapseKey(['', 'settings'], '', true)).toEqual([]);
    expect(toggleCollapseKey(undefined, '', true)).toEqual(['']);
  });
});

describe('Collapse trigger modes', () => {
  it('inherits the global mode and respects per-item overrides', () => {
    expect(getCollapseTrigger(items[0], 'icon')).toBe('icon');
    expect(getCollapseTrigger(items[1], 'header')).toBe('disabled');
    expect(getCollapseTrigger({ key: 'override', label: 'Override', collapsible: 'header' }, 'disabled')).toBe('header');
  });

  it('keeps a keyboard and pointer trigger when icon mode has no arrow', () => {
    expect(getCollapseTrigger({ key: 'no-arrow', label: 'No arrow', showArrow: false }, 'icon')).toBe('header');
    expect(getCollapseTrigger({ key: 'disabled', label: 'Disabled', showArrow: false, collapsible: 'disabled' }, 'icon')).toBe('disabled');
  });
});

describe('Collapse focus recovery', () => {
  it('prefers the same available header, including the empty string key', () => {
    expect(getCollapseFocusKey(items, '', ['settings'])).toBe('');
    expect(getCollapseFocusKey(items, 'settings', [])).toBe('settings');
  });

  it('falls back to an open header, then the first enabled header after removal or disabling', () => {
    expect(getCollapseFocusKey(items, 'removed', ['settings'])).toBe('settings');
    expect(getCollapseFocusKey(items, 'locked', [])).toBe('');
    expect(getCollapseFocusKey(items, undefined, ['locked'])).toBe('');
  });

  it('returns no header when empty or globally disabled unless an item overrides the mode', () => {
    expect(getCollapseFocusKey([], undefined, [])).toBeUndefined();
    expect(getCollapseFocusKey(items, '', [''], 'disabled')).toBeUndefined();
    expect(getCollapseFocusKey([{ key: 'override', label: 'Override', collapsible: 'header' }], undefined, [], 'disabled')).toBe('override');
  });
});
