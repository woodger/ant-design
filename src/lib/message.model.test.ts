import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { createMessage, messageHolderKey, type MessageClock } from './message.model.svelte.js';
import type { MessageOptions } from './message.types';

const clock: MessageClock = {
  now: () => Date.now(),
  schedule(callback, milliseconds) {
    const timer = setTimeout(callback, milliseconds);
    return () => clearTimeout(timer);
  }
};
function setup(options?: MessageOptions) {
  const api = createMessage(options);
  const view = api[messageHolderKey];
  const disconnect = view.connect(clock);
  view.setVisible(true);
  const mount = () => {
    for (const notice of view.notices)
      view.mounted(notice.id);
  };
  const finish = () => {
    for (const notice of view.notices)
      if (notice.closing)
        view.complete(notice.id, notice.version);
  };
  return { api, view, disconnect, mount, finish };
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('Message instance queue', () => {
  it('isolates queues before mounting without starting server timers', () => {
    const first = createMessage();
    const second = createMessage();
    first.info('First request');

    expect(first[messageHolderKey].notices.map((notice) => notice.content)).toEqual(
      ['First request']
    );
    expect(second[messageHolderKey].notices).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('creates typed methods and preserves string and snippet content', () => {
    const { api, view } = setup();
    const snippet = createRawSnippet(
      () => ({ render: () => '<strong>Snippet content</strong>' })
    );
    api.info('Info');
    api.success('Success');
    api.warning('Warning');
    api.error('Error');
    api.loading({ content: snippet, duration: 0 });

    expect(view.notices.map((notice) => notice.type)).toEqual(
      ['info', 'success', 'warning', 'error', 'loading']
    );
    expect(view.notices.at(-1)?.content).toBe(snippet);
    expect(view.notices.every((notice) => notice.role === 'status')).toBe(true);
  });

  it('starts the default three seconds only after content is mounted', () => {
    const { api, view, mount, finish } = setup();
    api.info('Timed');
    vi.advanceTimersByTime(10_000);

    expect(view.notices[0].closing).toBe(false);

    mount();
    vi.advanceTimersByTime(2999);

    expect(view.notices[0].closing).toBe(false);
    vi.advanceTimersByTime(1);

    expect(view.notices[0].closing).toBe(true);
    finish();

    expect(view.notices).toEqual([]);
  });

  it('keeps zero-duration messages until explicitly closed', async () => {
    const { api, view, mount, finish } = setup();
    const handle = api.loading('Saving', 0);
    mount();
    vi.advanceTimersByTime(100_000);

    expect(view.notices[0].closing).toBe(false);
    expect(vi.getTimerCount()).toBe(0);

    handle();
    finish();

    expect(await handle).toBe(true);
  });

  it('applies per-instance duration and typed positional callbacks', () => {
    const { api, view, mount } = setup({ duration: 5 });
    const onClose = vi.fn();
    api.error('Error', 1, onClose);
    api.success('Saved', onClose);
    mount();
    vi.advanceTimersByTime(1000);

    expect(view.notices.map((notice) => notice.closing)).toEqual([true, false]);
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(4000);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('preserves zero, empty and differently typed keys without coercion', () => {
    const { api, view } = setup();
    api.open({ key: 0, content: 'Zero' });
    api.open({ key: '', content: 'Empty' });
    api.open({ key: '0', content: 'String zero' });
    api.open({ key: 0, content: 'Updated zero' });

    expect(view.notices.map((notice) => [notice.key, notice.content])).toEqual(
      [[0, 'Updated zero'], ['', 'Empty'], ['0', 'String zero']]
    );
  });

  it('updates an active key in place and restarts its duration', () => {
    const { api, view, mount } = setup();
    api.loading({ key: 'save', content: 'Saving', duration: 1 });
    api.info({ content: 'Other', duration: 0 });
    mount();
    const id = view.notices[0].id;
    vi.advanceTimersByTime(750);
    api.success({ key: 'save', content: 'Saved', duration: 2 });
    vi.advanceTimersByTime(500);

    expect(view.notices[0]).toMatchObject(
      { id, content: 'Saved', type: 'success', closing: false }
    );
    vi.advanceTimersByTime(1500);

    expect(view.notices[0].closing).toBe(true);
    expect(view.notices[1].closing).toBe(false);
  });

  it('shares completion across updates and calls only the latest close callback', async () => {
    const { api, mount, finish } = setup();
    const old = vi.fn();
    const latest = vi.fn();
    const first = api.loading({ key: 'save', content: 'Saving', duration: 0, onClose: old });
    mount();
    const second = api.success({ key: 'save', content: 'Saved', duration: 0, onClose: latest });
    first();
    finish();

    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(old).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it('ignores stale completion and handles after a removed key is reused', async () => {
    const { api, view, mount, finish } = setup();
    const old = api.info({ key: 'same', content: 'Old', duration: 0 });
    mount();
    const previous = view.notices[0];
    old();
    finish();
    api.info({ key: 'same', content: 'New', duration: 0 });
    mount();
    old();
    view.complete(previous.id, previous.version);

    expect(await old).toBe(true);
    expect(view.notices).toHaveLength(1);
    expect(view.notices[0]).toMatchObject({ content: 'New', closing: false });
  });

  it('creates a fresh entry when a closing key is reopened', async () => {
    const { api, view, mount } = setup();
    const old = api.info({ key: 'same', content: 'Old', duration: 0 });
    mount();
    old();
    const previous = view.notices[0];
    api.success({ key: 'same', content: 'New', duration: 0 });
    mount();
    view.complete(previous.id, previous.version);

    expect(await old).toBe(true);
    expect(view.notices).toHaveLength(1);
    expect(view.notices[0]).toMatchObject({ content: 'New', closing: false });
  });

  it('evicts the oldest active message without moving updated keys', async () => {
    const { api, view, mount, finish } = setup({ maxCount: 2 });
    const first = api.info({ key: 'first', content: 'First', duration: 0 });
    api.info({ key: 'second', content: 'Second', duration: 0 });
    mount();
    api.success({ key: 'first', content: 'Updated first', duration: 0 });
    api.info({ key: 'third', content: 'Third', duration: 0 });

    expect(view.notices.filter((notice) => !notice.closing).map((notice) => notice.key)).toEqual(
      ['second', 'third']
    );
    finish();

    expect(await first).toBe(true);
  });

  it('closes queued messages before mounting without leaving pending handles', async () => {
    const api = createMessage();
    const callback = vi.fn();
    const pending = api.info({ content: 'Queued', onClose: callback });
    api.destroy();

    expect(await pending).toBe(true);
    expect(api[messageHolderKey].notices).toEqual([]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('closes one explicit key or all messages and notifies only once', () => {
    const { api, view, mount, finish } = setup();
    const callback = vi.fn();
    api.info({ key: 0, content: 'Zero', duration: 0, onClose: callback });
    api.info({ key: '', content: 'Empty', duration: 0, onClose: callback });
    mount();
    api.destroy(0);
    api.destroy(0);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(view.notices.map((notice) => notice.closing)).toEqual([true, false]);
    api.destroy();
    finish();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(view.notices).toEqual([]);
  });
});

describe('Message clock ownership', () => {
  it('pauses on hover and resumes only the remaining duration', () => {
    const { api, view, mount } = setup();
    api.info('Hover');
    mount();
    vi.advanceTimersByTime(1000);
    view.hover(view.notices[0].id, true);
    vi.advanceTimersByTime(10_000);

    expect(view.notices[0].closing).toBe(false);
    view.hover(view.notices[0].id, false);
    vi.advanceTimersByTime(1999);

    expect(view.notices[0].closing).toBe(false);
    vi.advanceTimersByTime(1);

    expect(view.notices[0].closing).toBe(true);
  });

  it('respects global and per-message hover overrides', () => {
    const { api, view, mount } = setup({ pauseOnHover: false });
    api.info({ content: 'Runs', duration: 1 });
    api.info({ content: 'Pauses', duration: 1, pauseOnHover: true });
    mount();
    for (const notice of view.notices)
      view.hover(notice.id, true);
    vi.advanceTimersByTime(1000);

    expect(view.notices.map((notice) => notice.closing)).toEqual([true, false]);
  });

  it('restarts updated hovered messages without losing their pause state', () => {
    const { api, view, mount } = setup();
    api.info({ key: 'same', content: 'Old', duration: 1 });
    mount();
    view.hover(view.notices[0].id, true);
    api.success({ key: 'same', content: 'New', duration: 2 });
    vi.advanceTimersByTime(5000);

    expect(view.notices[0].closing).toBe(false);
    view.hover(view.notices[0].id, false);
    vi.advanceTimersByTime(2000);

    expect(view.notices[0].closing).toBe(true);
  });

  it('pauses hidden contexts and resumes their remaining time', () => {
    const { api, view, mount } = setup();
    api.info('Context');
    mount();
    vi.advanceTimersByTime(1000);
    view.setVisible(false);
    vi.advanceTimersByTime(10_000);

    expect(vi.getTimerCount()).toBe(0);
    view.setVisible(true);
    vi.advanceTimersByTime(2000);

    expect(view.notices[0].closing).toBe(true);
  });

  it('does not start mounted messages in a hidden holder', () => {
    const { api, view, mount } = setup();
    view.setVisible(false);
    api.info('Hidden');
    mount();
    vi.advanceTimersByTime(5000);

    expect(vi.getTimerCount()).toBe(0);
    expect(view.notices[0].closing).toBe(false);
  });

  it('settles unmounted handles with false without close callbacks or timers', async () => {
    const { api, view, mount, disconnect } = setup();
    const callback = vi.fn();
    const task = api.loading({ content: 'Pending', onClose: callback });
    mount();
    disconnect();

    expect(await task).toBe(false);
    expect(await api.success('Late result')).toBe(false);
    expect(view.notices).toEqual([]);
    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('allows the same instance to reconnect after dropping late unmounted calls', () => {
    const { api, view, mount, disconnect } = setup();
    api.info('Old');
    mount();
    disconnect();
    view.connect(clock);
    view.setVisible(true);
    api.info('Fresh');
    mount();

    expect(view.notices.map((notice) => notice.content)).toEqual(['Fresh']);
    expect(vi.getTimerCount()).toBe(1);
  });

  it(
    'does not run further batch callbacks after a callback disconnects the holder',
    async () => {
      const { api, view, mount, disconnect } = setup();
      const next = vi.fn();
      const first = api.info({ content: 'First', onClose: disconnect });
      const second = api.info({ content: 'Second', onClose: next });
      mount();
      api.destroy();

      expect(await first).toBe(false);
      expect(await second).toBe(false);
      expect(next).not.toHaveBeenCalled();
      expect(view.notices).toEqual([]);
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it('rejects duplicate holders without disconnecting the first owner', () => {
    const { api, view, mount } = setup();
    api.info('Active');
    mount();

    expect(() => view.connect(clock)).toThrow('one mounted MessageHolder');
    expect(vi.getTimerCount()).toBe(1);
  });

  it('ignores cancelled timer callbacks even when a key is reused', () => {
    const api = createMessage();
    const view = api[messageHolderKey];
    const queued: (() => void)[] = [];
    view.connect({
      now: () => 0,
      schedule(callback) {
        queued.push(callback);
        return () => { };
      }
    });
    view.setVisible(true);
    api.info({ key: 'save', content: 'Old' });
    view.mounted(view.notices[0].id);
    api.success({ key: 'save', content: 'New', duration: 0 });
    queued[0]();

    expect(view.notices[0]).toMatchObject({ content: 'New', closing: false });
  });

  it('bounds long timers and normalizes invalid durations and limits', () => {
    const { api, view, mount } = setup({ duration: -1, maxCount: 0 });
    api.info({ content: 'Fallback', duration: NaN });
    api.info({ content: 'Long', duration: Number.MAX_VALUE });
    mount();
    vi.advanceTimersByTime(3000);

    expect(view.notices.map((notice) => notice.closing)).toEqual([true, false]);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('settles all queued messages even if one close callback throws', async () => {
    const api = createMessage();
    const next = vi.fn();
    const first = api.info({
      content: 'First',
      onClose: () => {
        throw Error('Callback failed');
      }
    });
    const second = api.info({ content: 'Second', onClose: next });

    expect(() => api.destroy()).toThrow('Callback failed');
    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(next).toHaveBeenCalledOnce();
    expect(api[messageHolderKey].notices).toEqual([]);
  });
});
