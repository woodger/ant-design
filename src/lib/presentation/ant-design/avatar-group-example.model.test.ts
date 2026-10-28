import { describe, expect, it } from 'vitest';
import { createAvatarGroupExample } from './avatar-group-example.model.svelte';

describe('AvatarGroup team', () => {
  it('adds normalized names and Unicode initials with independent identities', () => {
    const first = createAvatarGroupExample(); const second = createAvatarGroupExample(); expect(first.add('  алёна   Смирнова  ')).toBe(true); expect(first.members.at(-1)?.label).toBe('алёна Смирнова'); expect(first.members.at(-1)?.text).toBe('АС'); expect(second.members).toHaveLength(5);
    expect(first.add('😀 Тест')).toBe(true); expect(first.members.at(-1)?.text).toBe('😀Т'); expect(new Set(first.members.map(member => member.key)).size).toBe(7); expect(first.add('  ')).toBe(false); expect(first.members).toHaveLength(7);
  });
  it('reorders by key without mutating a previous array or accepting out-of-bounds moves', () => {
    const model = createAvatarGroupExample(); const previous = model.members; const key = previous[1].key;
    expect(model.move(key, -1)).toBe(true); expect(model.members[0].key).toBe(key); expect(previous[0].label).toBe('Анна Новикова'); expect(model.move(key, -1)).toBe(false); expect(model.move(999, 1)).toBe(false); expect(model.move(model.members.at(-1)!.key, 1)).toBe(false);
  });
  it('removes a member once and resets with fresh keys that reject stale actions', () => {
    const model = createAvatarGroupExample(); const previous = model.members; const key = previous[0].key; expect(model.remove(key)).toBe(true); expect(model.remove(key)).toBe(false); expect(model.members).toHaveLength(4); expect(previous).toHaveLength(5);
    model.add('Новый участник'); model.reset(); expect(model.members).toHaveLength(5); expect(model.members[0].label).toBe('Анна Новикова'); expect(model.members.every(member => !previous.some(old => old.key === member.key))).toBe(true); expect(model.remove(key)).toBe(false);
  });
});
