import { describe, expect, it } from 'vitest';
import { createAvatarExample } from './avatar-example.model.svelte';

describe('Avatar participants', () => {
  it('keeps participant selection and pictures isolated between examples', () => {
    const first = createAvatarExample(); const second = createAvatarExample(); expect(first.participants).toHaveLength(3); expect(first.selected).toBeUndefined();
    expect(first.select('anna')).toBe(true); expect(first.selected?.name).toBe('Анна Новикова'); expect(second.selected).toBeUndefined(); first.setPicture('anna', 'initials'); expect(second.participants[0].picture).toBe('image');
  });
  it('changes only the requested picture without mutating a previous snapshot', () => {
    const model = createAvatarExample(); model.select('anna'); const snapshot = model.selected;
    expect(model.setPicture('anna', 'broken')).toBe(true); expect(model.selected?.picture).toBe('broken'); expect(snapshot?.picture).toBe('image'); expect(model.participants[1].picture).toBe('initials'); expect(model.participants).toHaveLength(3);
    expect(model.setPicture('anna', 'broken')).toBe(false); expect(model.setPicture('missing', 'image')).toBe(false); expect(model.select('missing')).toBe(false); expect(model.selected?.key).toBe('anna');
  });
  it('resets participant pictures and clears the selected profile', () => {
    const model = createAvatarExample(); model.select('vera'); model.setPicture('vera', 'image'); model.setPicture('anna', 'initials'); model.reset();
    expect(model.selected).toBeUndefined(); expect(model.participants[0].picture).toBe('image'); expect(model.participants[2].picture).toBe('broken'); expect(model.participants.map(person => person.unread)).toEqual([3, 0, 1]);
  });
});
