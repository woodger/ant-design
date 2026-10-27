import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSpinLoad } from './spin-load.model.svelte';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe('Spin profile loading', () => {
  it('starts idle without server timers', () => {
    const model = createSpinLoad(); expect(model.status).toBe('idle'); expect(model.revision).toBe(0); expect(vi.getTimerCount()).toBe(0);
  });
  it('completes fast and normal loads once and rejects duplicate starts', () => {
    const model = createSpinLoad(); expect(model.load('fast')).toBe(true); expect(model.load()).toBe(false);
    vi.advanceTimersByTime(49); expect(model.loading).toBe(true); vi.advanceTimersByTime(1);
    expect(model.status).toBe('ready'); expect(model.revision).toBe(1);
    model.load(); vi.advanceTimersByTime(699); expect(model.loading).toBe(true); expect(model.revision).toBe(1);
    vi.advanceTimersByTime(1); expect(model.revision).toBe(2); expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves loaded data on failure and supports a successful retry', () => {
    const model = createSpinLoad(); model.load('fast'); vi.advanceTimersByTime(50);
    model.load('error'); vi.advanceTimersByTime(700); expect(model.status).toBe('error'); expect(model.revision).toBe(1);
    model.load(); vi.advanceTimersByTime(700); expect(model.status).toBe('ready'); expect(model.revision).toBe(2);
  });
  it('cancels pending work and prevents its result from replacing a newer load', () => {
    const model = createSpinLoad(); model.load('error'); vi.advanceTimersByTime(100); expect(model.cancel()).toBe(true);
    expect(model.status).toBe('cancelled'); expect(vi.getTimerCount()).toBe(0);
    model.load(); vi.advanceTimersByTime(600); expect(model.status).toBe('loading'); expect(model.revision).toBe(0);
    vi.advanceTimersByTime(100); expect(model.status).toBe('ready'); expect(model.revision).toBe(1);
  });
  it('resets quietly without a late completion', () => {
    const model = createSpinLoad(); model.load(); model.reset(); vi.advanceTimersByTime(1000);
    expect(model.status).toBe('idle'); expect(model.revision).toBe(0); expect(model.cancel()).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it('disposes pending work and rejects late requests', () => {
    const model = createSpinLoad(); model.load(); model.destroy(); vi.advanceTimersByTime(1000);
    expect(model.load()).toBe(false); expect(model.revision).toBe(0); expect(vi.getTimerCount()).toBe(0);
  });
});
