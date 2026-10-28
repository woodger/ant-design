import { describe, expect, it } from 'vitest';
import { createBadgeInbox } from './badge-inbox.model.svelte';

describe('Badge unread messages', () => {
  it('derives the initial unread count from independent local messages', () => {
    const first = createBadgeInbox(); const second = createBadgeInbox(); expect(first.messages).toHaveLength(3); expect(first.unreadCount).toBe(2);
    first.add(); expect(first.unreadCount).toBe(3); expect(second.messages).toHaveLength(3); expect(second.unreadCount).toBe(2);
  });
  it('marks a message once without removing it or mutating the previous snapshot', () => {
    const model = createBadgeInbox(); const snapshot = model.messages[0]; expect(model.markRead(snapshot.key)).toBe(true); expect(model.unreadCount).toBe(1); expect(model.messages).toHaveLength(3); expect(snapshot.read).toBe(false);
    expect(model.markRead(snapshot.key)).toBe(false); expect(model.markRead(999)).toBe(false); expect(model.unreadCount).toBe(1);
  });
  it('marks all messages as read idempotently and counts subsequently added messages', () => {
    const model = createBadgeInbox(); expect(model.readAll()).toBe(2); expect(model.readAll()).toBe(0); expect(model.unreadCount).toBe(0); expect(model.messages).toHaveLength(3);
    model.add(); expect(model.unreadCount).toBe(1); expect(model.messages.at(-1)?.read).toBe(false);
  });
  it('keeps the full batch count and unique identities independently of display overflow', () => {
    const model = createBadgeInbox(); model.addBatch(); expect(model.unreadCount).toBe(102); expect(model.messages).toHaveLength(103); expect(new Set(model.messages.map(message => message.key)).size).toBe(103);
    expect(model.readAll()).toBe(102); expect(model.messages).toHaveLength(103); expect(model.unreadCount).toBe(0);
  });
  it('resets to the initial content using fresh keys', () => {
    const model = createBadgeInbox(); const old = model.messages.map(message => message.key); model.readAll(); model.addBatch(); model.reset();
    expect(model.messages).toHaveLength(3); expect(model.unreadCount).toBe(2); expect(model.messages.every(message => !old.includes(message.key))).toBe(true); expect(model.markRead(old[0])).toBe(false);
  });
});
