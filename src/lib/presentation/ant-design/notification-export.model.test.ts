import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNotificationExport } from './notification-export.model.svelte';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe('Notification export progress', () => {
  it('starts idle without server timers or callbacks', () => {
    const onReady = vi.fn(); const onError = vi.fn(); const model = createNotificationExport({ onReady, onError });
    expect(model.status).toBe('idle'); expect(model.percent).toBe(0); expect(model.report).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0); expect(onReady).not.toHaveBeenCalled(); expect(onError).not.toHaveBeenCalled();
  });
  it('reports monotonic stages before publishing a complete CSV exactly once', () => {
    const onReady = vi.fn(); const onError = vi.fn(); const model = createNotificationExport({ onReady, onError });
    expect(model.start()).toBe(true); expect(model.percent).toBe(0);
    vi.advanceTimersByTime(200); expect(model.percent).toBe(25); expect(model.phase).toContain('Собираем');
    vi.advanceTimersByTime(250); expect(model.percent).toBe(65); expect(model.report).toBeUndefined();
    vi.advanceTimersByTime(150); expect(model.percent).toBe(90); expect(onReady).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100); expect(model.status).toBe('ready'); expect(model.percent).toBe(100);
    expect(model.report).toContain('Anna,Svelte\r\nBoris,TypeScript'); expect(onReady).toHaveBeenCalledOnce(); expect(onError).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('rejects duplicate starts and reports failures without making a file available', () => {
    const onReady = vi.fn(); const onError = vi.fn(); const model = createNotificationExport({ onReady, onError });
    model.start(true); expect(model.start()).toBe(false); vi.advanceTimersByTime(700);
    expect(model.status).toBe('error'); expect(model.percent).toBe(90); expect(model.report).toBeUndefined();
    expect(onError).toHaveBeenCalledOnce(); expect(onReady).not.toHaveBeenCalled();
    expect(model.start()).toBe(true); expect(model.percent).toBe(0); vi.advanceTimersByTime(700);
    expect(model.status).toBe('ready'); expect(onReady).toHaveBeenCalledOnce();
  });
  it('cancels at the current percentage and prevents an older attempt from completing a retry', () => {
    const onReady = vi.fn(); const onError = vi.fn(); const model = createNotificationExport({ onReady, onError });
    model.start(true); vi.advanceTimersByTime(450); expect(model.cancel()).toBe(true);
    expect(model.status).toBe('cancelled'); expect(model.percent).toBe(65); expect(vi.getTimerCount()).toBe(0);
    model.start(); vi.advanceTimersByTime(250);
    expect(model.status).toBe('preparing'); expect(model.percent).toBe(25); expect(onError).not.toHaveBeenCalled();
    vi.advanceTimersByTime(450); expect(model.status).toBe('ready'); expect(onReady).toHaveBeenCalledOnce();
  });
  it('resets the operation and invalidates all pending results', () => {
    const onReady = vi.fn(); const onError = vi.fn(); const model = createNotificationExport({ onReady, onError });
    model.start(); vi.advanceTimersByTime(200); model.reset(); vi.advanceTimersByTime(1000);
    expect(model.status).toBe('idle'); expect(model.percent).toBe(0); expect(model.cancel()).toBe(false);
    expect(onReady).not.toHaveBeenCalled(); expect(onError).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('disposes pending work quietly and rejects late starts', () => {
    const onReady = vi.fn(); const onError = vi.fn(); const model = createNotificationExport({ onReady, onError });
    model.start(); model.destroy(); vi.advanceTimersByTime(1000);
    expect(model.start()).toBe(false); expect(model.report).toBeUndefined();
    expect(onReady).not.toHaveBeenCalled(); expect(onError).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
});
