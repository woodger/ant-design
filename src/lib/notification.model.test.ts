import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { createNotification, notificationHolderKey } from './notification.model.svelte.js';
import type { NotificationOptions } from './notification.types';

function setup(options?: NotificationOptions) {
  const api = createNotification(options);
  const view = api[notificationHolderKey];
  const disconnect = view.connect({
    now: () => Date.now(),
    schedule(callback, milliseconds) {
      const timer = setTimeout(callback, milliseconds);
      return () => clearTimeout(timer);
    }
  });
  view.setVisible(true);
  const mount = () => {
    for (const item of view.notices)
      view.mounted(item.id);
  };
  const finish = () => {
    for (const item of view.notices)
      if (item.closing)
        view.complete(item.id, item.version);
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

describe('Notification instance queue', () => {
  it('isolates fresh queues without starting server timers', () => {
    const first = createNotification();
    const second = createNotification();
    first.open({ title: 'Private export', description: 'Preparing report' });

    expect(first[notificationHolderKey].notices[0]).toMatchObject(
      { title: 'Private export', placement: 'topRight', role: 'alert' }
    );
    expect(second[notificationHolderKey].notices).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('supports four typed methods and a neutral open without an icon type', () => {
    const { api, view } = setup();
    api.open({ title: 'Neutral' });
    for (const type of ['info', 'success', 'warning', 'error'] as const)
      api[type]({ title: type });

    expect(view.notices.map((item) => item.type)).toEqual(
      [undefined, 'info', 'success', 'warning', 'error']
    );
  });

  it('preserves title, description, icon, actions and close options', () => {
    const { api, view } = setup();
    const snippet = createRawSnippet(() => ({ render: () => '<strong>Report</strong>' }));
    const closable = { closeIcon: '×', 'aria-label': 'Dismiss report' };
    api.success(
      {
        title: snippet,
        description: snippet,
        icon: snippet,
        actions: snippet,
        closable,
        role: 'status'
      }
    );

    expect(view.notices[0]).toMatchObject(
      {
        title: snippet,
        description: snippet,
        icon: snippet,
        actions: snippet,
        closable,
        role: 'status'
      }
    );
  });

  it('starts the default four and a half seconds only after rendering', () => {
    const { api, view, mount, finish } = setup();
    api.info({ title: 'Report ready' });
    vi.advanceTimersByTime(10_000);

    expect(view.notices[0].closing).toBe(false);
    mount();
    vi.advanceTimersByTime(4499);

    expect(view.notices[0].closing).toBe(false);
    vi.advanceTimersByTime(1);

    expect(view.notices[0].closing).toBe(true);
    finish();

    expect(view.notices).toEqual([]);
  });

  it('supports persistent zero and false durations including instance defaults', () => {
    const { api, view, mount } = setup({ duration: false });
    api.open({ title: 'Default' });
    api.open({ title: 'Zero', duration: 0 });
    api.open({ title: 'False', duration: false });
    mount();
    vi.advanceTimersByTime(100_000);

    expect(view.notices.map((item) => item.closing)).toEqual([false, false, false]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('normalizes invalid durations to the Notification default', () => {
    const { api, view, mount } = setup({ duration: -1 });
    api.open({ title: 'Invalid default', duration: NaN });
    mount();
    vi.advanceTimersByTime(4499);

    expect(view.notices[0].closing).toBe(false);
    vi.advanceTimersByTime(1);

    expect(view.notices[0].closing).toBe(true);
  });

  it('supports default placement and per-notification overrides', () => {
    const { api, view } = setup({ placement: 'bottomLeft' });
    api.open({ title: 'Default' });
    api.open({ title: 'Override', placement: 'top' });

    expect(view.notices.map((item) => item.placement)).toEqual(['bottomLeft', 'top']);
  });

  it('updates active keys in place with the latest content and callback', () => {
    const { api, view, mount, finish } = setup();
    const old = vi.fn();
    const latest = vi.fn();
    api.info({ key: 0, title: 'Preparing', duration: 0, onClose: old });
    api.open({ key: '', title: 'Other', duration: 0 });
    mount();
    const id = view.notices[0].id;
    api.success({ key: 0, title: 'Ready', placement: 'bottom', duration: 0, onClose: latest });

    expect(view.notices.map((item) => item.title)).toEqual(['Ready', 'Other']);
    expect(view.notices[0]).toMatchObject({ id, type: 'success', placement: 'bottom' });
    api.destroy(0);
    finish();

    expect(old).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
    expect(view.notices[0].key).toBe('');
  });

  it('applies maxCount globally across placements and keeps FIFO on updates', () => {
    const { api, view, mount, finish } = setup({ maxCount: 2 });
    const evicted = vi.fn();
    api.open({ key: 'first', title: 'First', onClose: evicted, duration: 0 });
    api.open({ key: 'second', title: 'Second', placement: 'bottomRight', duration: 0 });
    mount();
    api.open({ key: 'first', title: 'Updated', onClose: evicted, duration: 0 });
    api.open({ title: 'Third', placement: 'topLeft', duration: 0 });

    expect(view.notices.filter((item) => !item.closing).map((item) => item.title)).toEqual(
      ['Second', 'Third']
    );
    expect(evicted).toHaveBeenCalledOnce();
    finish();

    expect(view.notices).toHaveLength(2);
  });

  it('pauses focus independently of disabled hover pauses and resumes remaining time', () => {
    const { api, view, mount } = setup({ duration: 1, pauseOnHover: false });
    api.open({ title: 'Download' });
    mount();
    vi.advanceTimersByTime(400);
    view.focus(view.notices[0].id, true);
    vi.advanceTimersByTime(10_000);

    expect(view.notices[0].closing).toBe(false);
    view.focus(view.notices[0].id, false);
    vi.advanceTimersByTime(599);

    expect(view.notices[0].closing).toBe(false);
    vi.advanceTimersByTime(1);

    expect(view.notices[0].closing).toBe(true);
  });

  it('keeps updated focused notifications paused until focus leaves', () => {
    const { api, view, mount } = setup({ duration: 1 });
    api.open({ key: 'task', title: 'Preparing' });
    mount();
    view.focus(view.notices[0].id, true);
    api.success({ key: 'task', title: 'Ready' });
    vi.advanceTimersByTime(10_000);

    expect(view.notices[0].closing).toBe(false);
    view.focus(view.notices[0].id, false);
    vi.advanceTimersByTime(1000);

    expect(view.notices[0].closing).toBe(true);
  });

  it('requires both focus and hover to leave before resuming', () => {
    const { api, view, mount } = setup({ duration: 1 });
    api.open({ title: 'Ready' });
    mount();
    const id = view.notices[0].id;
    view.hover(id, true);
    view.focus(id, true);
    view.focus(id, false);
    vi.advanceTimersByTime(5000);

    expect(view.notices[0].closing).toBe(false);
    view.hover(id, false);
    vi.advanceTimersByTime(1000);

    expect(view.notices[0].closing).toBe(true);
  });

  it('pauses hidden holders and starts their timers only when visible', () => {
    const { api, view, mount } = setup({ duration: 1 });
    view.setVisible(false);
    api.open({ title: 'Hidden' });
    mount();
    vi.advanceTimersByTime(5000);

    expect(view.notices[0].closing).toBe(false);
    view.setVisible(true);
    vi.advanceTimersByTime(1000);

    expect(view.notices[0].closing).toBe(true);
  });

  it('clears detached queues quietly and drops late calls until reconnecting', () => {
    const { api, view, mount, disconnect } = setup();
    const callback = vi.fn();
    api.open({ title: 'Pending', onClose: callback });
    mount();
    disconnect();
    api.error({ title: 'Late response', onClose: callback });
    vi.advanceTimersByTime(10_000);

    expect(view.notices).toEqual([]);
    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    const stop = view.connect({ now: () => 0, schedule: () => () => { } });
    api.success({ title: 'Reconnected', duration: 0 });

    expect(view.notices[0].title).toBe('Reconnected');
    stop();
  });

  it('does not remove a reopened closing key through a stale completion', () => {
    const { api, view, mount } = setup({ duration: 0 });
    api.open({ key: 'task', title: 'Old' });
    mount();
    const old = view.notices[0];
    api.destroy('task');
    api.open({ key: 'task', title: 'New' });
    view.complete(old.id, old.version);

    expect(view.notices.map((item) => item.title)).toEqual(['New']);
    expect(view.notices[0].closing).toBe(false);
  });

  it('closes an anonymous notice by its rendered identity exactly once', () => {
    const { api, view, mount, finish } = setup();
    const callback = vi.fn();
    api.open({ title: 'Anonymous', onClose: callback });
    mount();
    const id = view.notices[0].id;
    view.close(id);
    view.close(id);

    expect(callback).toHaveBeenCalledOnce();
    expect(view.notices[0].closing).toBe(true);
    finish();

    expect(view.notices).toEqual([]);
  });
});
