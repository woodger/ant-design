import { describe, expect, it } from 'vitest';
import { getAvatarGroupItems } from './avatar-group.engine';
import type { AvatarGroupItem } from './avatar-group.types';

const items: readonly AvatarGroupItem[] = [{ key: 0, label: 'Анна', text: 'А' }, { key: '0', label: 'Дмитрий', text: 'Д' }, { key: 'vera', label: 'Вера', text: 'В' }];

describe('AvatarGroup items', () => {
  it('keeps the first item for each key without conflating numbers with strings', () => {
    const duplicate = { key: 0, label: 'Duplicate' }; const input = [...items, duplicate]; const state = getAvatarGroupItems(input);
    expect(state.visible).toEqual(items); expect(state.hidden).toEqual([]); expect(state.visible[0]).toBe(items[0]); expect(input).toHaveLength(4); expect(duplicate.label).toBe('Duplicate');
  });
  it('limits visible participants and counts overflow separately from the indicator', () => {
    const state = getAvatarGroupItems(items, 2); expect(state.visible).toEqual(items.slice(0, 2)); expect(state.hidden).toEqual([items[2]]);
    expect(getAvatarGroupItems(items, 3).hidden).toEqual([]); expect(getAvatarGroupItems(items, 100).visible).toEqual(items);
  });
  it.each([undefined, 0, -1, NaN, Infinity, -Infinity])('shows everyone for an absent or invalid limit %s', count => {
    expect(getAvatarGroupItems(items, count).visible).toEqual(items); expect(getAvatarGroupItems(items, count).hidden).toEqual([]);
  });
  it('truncates positive fractional limits without hiding every participant', () => {
    expect(getAvatarGroupItems(items, 2.9).visible).toHaveLength(2); expect(getAvatarGroupItems(items, 0.5).visible).toEqual([items[0]]);
  });
  it('applies limits after deduplication and preserves the current item order', () => {
    const state = getAvatarGroupItems([items[2], items[0], items[2], items[1]], 2); expect(state.visible).toEqual([items[2], items[0]]); expect(state.hidden).toEqual([items[1]]); expect(getAvatarGroupItems([], 2)).toEqual({ visible: [], hidden: [] });
  });
});
