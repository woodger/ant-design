import { describe, it, expect } from 'vitest';
import {
  buildMenuEntries,
  menuLevel,
  menuVisible,
  menuSelection,
  menuOpenKeys,
  menuKeyboardAction
} from './menu.engine';
import type { MenuItemType } from './menu.types';
const items: MenuItemType[] = [
  {
    key: 'root',
    label: 'Root',
    children: [
      { type: 'group', key: 'group', label: 'Group', children: [{ key: 7, label: 'Numeric' }] },
      { key: 'nested', label: 'Nested', children: [{ key: 'leaf', label: 'Leaf' }] }
    ]
  },
  { type: 'divider' },
  { key: 'last', label: 'Last' }
];
describe('Menu source selection and navigation', () => {
  it('normalizes item keys and excludes groups from event key paths', () => {
    const m = buildMenuEntries(items);

    expect(m.entries.get('7')?.path).toEqual(['root', '7']);
    expect(m.entries.get('7')?.item.key).toBe(7);
    expect(m.entries.get('leaf')?.path).toEqual(['root', 'nested', 'leaf']);
  });
  it('keeps groups transparent to sibling navigation and dividers noninteractive', () => {
    const m = buildMenuEntries(items);

    expect(menuLevel(m.roots).map(e => e.key)).toEqual(['root', 'last']);
    expect(menuLevel(m.entries.get('root')!.children).map(e => e.key)).toEqual(['7', 'nested']);
  });
  it(
    'walks all visible inline items while popup navigation remains at the current level',
    () => {
      const m = buildMenuEntries(items);

      expect(menuVisible(m.roots, ['root', 'nested'], true).map(e => e.key)).toEqual(
        ['root', '7', 'nested', 'leaf', 'last']
      );
      expect(menuVisible(m.roots, ['root', 'nested'], false).map(e => e.key)).toEqual(
        ['root', 'last']
      );
    }
  );
  it(
    'retains selected key on a repeated single click while emitting the source deselect branch',
    () => {
      expect(menuSelection(['a'], 'a', false)).toEqual({ keys: ['a'], deselect: true });
      expect(menuSelection(['a'], 'b', false)).toEqual({ keys: ['b'], deselect: false });
      expect(menuSelection(['a'], 'a', true)).toEqual({ keys: [], deselect: true });
    }
  );
  it('preserves inline descendant open keys and removes them for popup closing', () => {
    const m = buildMenuEntries(items);
    const root = m.entries.get('root')!;

    expect(menuOpenKeys(['root', 'nested', 'other'], root, false, 'inline')).toEqual(
      ['nested', 'other']
    );
    expect(menuOpenKeys(['root', 'nested', 'other'], root, false, 'vertical')).toEqual(['other']);
  });
  it('maps horizontal root arrows by RTL and uses vertical mapping inside popups', () => {
    expect(menuKeyboardAction('horizontal', true, false, 'ArrowRight')).toBe('next');
    expect(menuKeyboardAction('horizontal', true, true, 'ArrowRight')).toBe('previous');
    expect(menuKeyboardAction('horizontal', false, false, 'ArrowLeft')).toBe('parent');
    expect(menuKeyboardAction('horizontal', false, true, 'ArrowLeft')).toBe('children');
  });
  it(
    'keeps inline Enter distinct from vertical child opening and ignores unsupported inline arrows',
    () => {
      expect(menuKeyboardAction('inline', false, false, 'Enter')).toBe('toggle');
      expect(menuKeyboardAction('inline', false, true, 'ArrowRight')).toBeNull();
      expect(menuKeyboardAction('vertical', false, false, 'Escape')).toBe('parent');
    }
  );
});
