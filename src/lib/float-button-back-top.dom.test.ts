import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBackTopRuntime } from './float-button-back-top.dom';
import type { BackTopTarget } from './float-button.types';
class ElementTarget extends EventTarget {
  scrollTop = 200;
  scrollHeight = 1000;
  clientHeight = 200;
  get target() { return this as unknown as HTMLElement; }
}
function setup() {
  vi.useFakeTimers();
  let next = 0;
  const frames = new Map<number, FrameRequestCallback>();
  let reduced = false;
  const view = Object.assign(new EventTarget(), { requestAnimationFrame: (fn: FrameRequestCallback) => { const id = ++next; frames.set(id, fn); return id; }, cancelAnimationFrame: (id: number) => frames.delete(id), matchMedia: () => ({ matches: reduced }) });
  const root = new ElementTarget();
  const states: { visible: boolean; progress: number }[] = [];
  const runtime = createBackTopRuntime(view as unknown as Window, state => { states.push(state); });
  const options = { getTarget: () => root.target as BackTopTarget | null, visibilityHeight: 100, showProgress: true };
  runtime.configure(options);
  const flush = (ms = 0) => { vi.advanceTimersByTime(ms); const callbacks = [...frames.values()]; frames.clear(); for (const fn of callbacks) fn(0); };
  return { view, root, runtime, options, states, frames, flush, reduce: () => { reduced = true; } };
}
afterEach(() => { vi.useRealTimers(); });
describe('BackTop scroll lifecycle', () => {
  it('coalesces scroll events and keeps progress independent of visibility', () => {
    const { root, runtime, states, frames, flush } = setup();
    expect(states.at(-1)).toEqual({ visible: true, progress: 0.25 });
    root.scrollTop = 50; root.dispatchEvent(new Event('scroll')); root.dispatchEvent(new Event('scroll'));
    expect(frames.size).toBe(1); flush();
    expect(states.at(-1)).toEqual({ visible: false, progress: 0.0625 }); runtime.destroy();
  });
  it('reads fresh progress on resize without recomputing visibility and cleans old targets', () => {
    const { view, root, runtime, options, states, flush } = setup();
    root.scrollHeight = 1800; root.scrollTop = 50;
    view.dispatchEvent(new Event('resize')); flush();
    expect(states.at(-1)).toEqual({ visible: true, progress: 0.03125 });
    const other = new ElementTarget(); other.scrollTop = 800;
    runtime.configure({ ...options, getTarget: () => other.target });
    expect(states.at(-1)).toEqual({ visible: true, progress: 1 });
    const count = states.length;
    root.dispatchEvent(new Event('scroll')); flush(); expect(states).toHaveLength(count);
    runtime.destroy(); other.dispatchEvent(new Event('scroll')); view.dispatchEvent(new Event('resize')); flush(); expect(states).toHaveLength(count);
  });
  it('accepts null and document targets and preserves the last progress while disabled', () => {
    const { runtime, root, options, states } = setup();
    runtime.configure({ ...options, getTarget: () => null, visibilityHeight: 0 });
    expect(states.at(-1)).toEqual({ visible: true, progress: 0 });
    runtime.configure({ ...options, getTarget: () => Object.assign(new EventTarget(), { documentElement: root.target }) as unknown as Document });
    expect(states.at(-1)).toEqual({ visible: true, progress: 0.25 });
    runtime.configure({ ...options, getTarget: () => null, showProgress: false });
    expect(states.at(-1)).toEqual({ visible: false, progress: 0.25 });
    runtime.scrollToTop(0); expect(root.scrollTop).toBe(200); runtime.destroy();
  });
  it('animates to zero with the configured duration and cancels superseded or destroyed frames', () => {
    const { runtime, root, frames, flush } = setup();
    runtime.scrollToTop(200); const first = [...frames.values()][0];
    runtime.scrollToTop(200); first(0); expect(root.scrollTop).toBe(200);
    flush(100); expect(root.scrollTop).toBe(100);
    const stale = [...frames.values()][0];
    runtime.destroy(); stale(0); expect(root.scrollTop).toBe(100); expect(frames.size).toBe(0);
  });
  it('respects reduced motion and immediate duration and cancels pending measurement on teardown', () => {
    const { runtime, root, frames, reduce } = setup();
    runtime.scrollToTop(0); expect(root.scrollTop).toBe(0);
    root.scrollTop = 200; reduce(); runtime.scrollToTop(450); expect(root.scrollTop).toBe(0); expect(frames.size).toBe(0);
    root.dispatchEvent(new Event('scroll')); expect(frames.size).toBe(1);
    runtime.destroy(); expect(frames.size).toBe(0);
  });
});
