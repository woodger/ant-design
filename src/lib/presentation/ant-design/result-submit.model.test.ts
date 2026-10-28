import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createResultSubmit } from './result-submit.model.svelte';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const draft = { name: 'Anna', email: 'anna@example.com' };

describe('Result form submission', () => {
  it('starts in editing mode without server timers', () => {
    const model = createResultSubmit(); expect(model.status).toBe('editing'); expect(model.submitted).toBeUndefined(); expect(vi.getTimerCount()).toBe(0);
  });
  it('submits a snapshot once and refuses an overlapping request', async () => {
    const model = createResultSubmit(); const values = { ...draft }; const request = model.submit(values);
    values.name = 'Changed'; expect(await model.submit(draft, true)).toBe('busy');
    vi.advanceTimersByTime(699); expect(model.status).toBe('submitting'); expect(model.submitted).toBeUndefined();
    vi.advanceTimersByTime(1); expect(await request).toBe('success'); expect(model.status).toBe('success'); expect(model.submitted).toEqual(draft); expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves the submitted values through failure, editing and a successful retry', async () => {
    const model = createResultSubmit(); const failed = model.submit(draft, true);
    vi.advanceTimersByTime(700); expect(await failed).toBe('error'); expect(model.status).toBe('error'); expect(model.submitted).toEqual(draft);
    expect(model.edit()).toBe(true); expect(model.submitted).toEqual(draft);
    const retried = model.submit(draft); vi.advanceTimersByTime(700); expect(await retried).toBe('success'); expect(model.submitted).toEqual(draft);
  });
  it('does not leave submission mode before pending work completes', async () => {
    const model = createResultSubmit(); const request = model.submit(draft);
    expect(model.edit()).toBe(false); expect(model.status).toBe('submitting');
    model.reset(); expect(await request).toBe('cancelled'); expect(model.status).toBe('editing');
  });
  it('settles a reset request and prevents its stale result from replacing a newer submission', async () => {
    const model = createResultSubmit(); const old = model.submit(draft, true); vi.advanceTimersByTime(100); model.reset();
    expect(await old).toBe('cancelled'); expect(model.submitted).toBeUndefined();
    const next = model.submit({ name: 'New', email: 'new@example.com' }); vi.advanceTimersByTime(600); expect(model.status).toBe('submitting');
    vi.advanceTimersByTime(100); expect(await next).toBe('success'); expect(model.submitted?.name).toBe('New'); expect(vi.getTimerCount()).toBe(0);
  });
  it('clears a completed result on reset', async () => {
    const model = createResultSubmit(); const request = model.submit(draft); vi.advanceTimersByTime(700); await request;
    model.reset(); expect(model.status).toBe('editing'); expect(model.submitted).toBeUndefined(); expect(vi.getTimerCount()).toBe(0);
  });
  it('settles pending work on unmount and rejects later requests', async () => {
    const model = createResultSubmit(); const request = model.submit(draft); model.destroy();
    expect(await request).toBe('cancelled'); vi.advanceTimersByTime(1000); expect(model.submitted).toBeUndefined();
    expect(await model.submit(draft)).toBe('cancelled'); expect(model.edit()).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
});
