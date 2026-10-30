import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSpinModel,
  normalizeSpinDelay,
  type SpinClock,
  type SpinRequest
} from './spin.model.svelte.js';

const clock: SpinClock = {
  schedule(callback, milliseconds) {
    const timer = setTimeout(callback, milliseconds);
    return () => clearTimeout(timer);
  }
};
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('Spin delay lifecycle', () => {
  it.each([undefined, NaN, Infinity, -Infinity, -10, 0])(
    'normalizes invalid delay %s to zero',
    (value) => {
      expect(normalizeSpinDelay(value)).toBe(0);
    }
  );
  it('uses integer milliseconds and bounds browser timeout overflow', () => {
    expect(normalizeSpinDelay(200.9)).toBe(200);
    expect(normalizeSpinDelay(0.9)).toBe(0);
    expect(normalizeSpinDelay(Number.MAX_VALUE)).toBe(2_147_483_647);
  });
  it('renders immediate and inactive states without starting server timers', () => {
    let request: SpinRequest = { spinning: true, delay: 0 };
    const model = createSpinModel(() => request);

    expect(model.visible).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    request = { spinning: false, delay: 0 };

    expect(model.visible).toBe(false);
  });
  it('starts a delayed appearance only after connecting to a browser clock', () => {
    const request: SpinRequest = { spinning: true, delay: 200 };
    const model = createSpinModel(() => request);
    vi.advanceTimersByTime(1000);

    expect(model.visible).toBe(false);
    const disconnect = model.connect(request, clock);
    vi.advanceTimersByTime(199);

    expect(model.visible).toBe(false);
    vi.advanceTimersByTime(1);

    expect(model.visible).toBe(true);
    disconnect();

    expect(vi.getTimerCount()).toBe(0);
  });
  it('never flashes when loading finishes during the delay', () => {
    let request: SpinRequest = { spinning: true, delay: 200 };
    const model = createSpinModel(() => request);
    const disconnect = model.connect(request, clock);
    vi.advanceTimersByTime(100);
    request = { spinning: false, delay: 200 };
    disconnect();
    vi.advanceTimersByTime(1000);

    expect(model.visible).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('invalidates an elapsed request synchronously when the delay changes', () => {
    let request: SpinRequest = { spinning: true, delay: 100 };
    const model = createSpinModel(() => request);
    const first = model.connect(request, clock);
    vi.advanceTimersByTime(100);

    expect(model.visible).toBe(true);
    request = { spinning: true, delay: 300 };

    expect(model.visible).toBe(false);
    first();
    const second = model.connect(request, clock);
    vi.advanceTimersByTime(299);

    expect(model.visible).toBe(false);
    vi.advanceTimersByTime(1);

    expect(model.visible).toBe(true);
    second();
  });
  it('uses a fresh delay after a completed loading cycle', () => {
    let request: SpinRequest = { spinning: true, delay: 100 };
    const model = createSpinModel(() => request);
    const first = model.connect(request, clock);
    vi.advanceTimersByTime(100);
    first();
    request = { spinning: false, delay: 100 };

    expect(model.visible).toBe(false);
    request = { spinning: true, delay: 100 };

    expect(model.visible).toBe(false);
    const second = model.connect(request, clock);
    vi.advanceTimersByTime(100);

    expect(model.visible).toBe(true);
    second();
  });
  it('ignores cancelled callbacks after unmount and after a newer request', () => {
    let request: SpinRequest = { spinning: true, delay: 100 };
    const callbacks: Array<() => void> = [];
    const model = createSpinModel(() => request);
    const stop = model.connect(request, {
      schedule(callback) {
        callbacks.push(callback);
        return () => { };
      }
    });
    stop();
    callbacks[0]();

    expect(model.visible).toBe(false);
    request = { spinning: true, delay: 200 };
    const disconnect = model.connect(request, {
      schedule(callback) {
        callbacks.push(callback);
        return () => { };
      }
    });
    callbacks[0]();

    expect(model.visible).toBe(false);
    callbacks[1]();

    expect(model.visible).toBe(true);
    disconnect();
  });
  it('cancels the pending timer when delay becomes immediate', () => {
    let request: SpinRequest = { spinning: true, delay: 200 };
    const model = createSpinModel(() => request);
    const stop = model.connect(request, clock);
    request = { spinning: true, delay: 0 };

    expect(model.visible).toBe(true);
    stop();
    vi.advanceTimersByTime(1000);

    expect(model.visible).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
