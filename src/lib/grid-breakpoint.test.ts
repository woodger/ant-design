import { describe, expect, it } from 'vitest';
import { createBreakpoint } from './grid-breakpoint.model.svelte.js';

describe('Grid breakpoint lifecycle', () => {
  it('keeps SSR empty and removes listeners and stale publications after disconnect', () => {
    const listeners = new Set<() => void>();
    const callbacks: (() => void)[] = [];
    let match = false;
    const view = { matchMedia: () => ({ get matches() { return match; }, addEventListener: (_: string, callback: () => void) => { listeners.add(callback); callbacks.push(callback); }, removeEventListener: (_: string, callback: () => void) => { listeners.delete(callback); } }) as unknown as MediaQueryList };
    const breakpoint = createBreakpoint();
    expect(breakpoint.screens).toEqual({});
    expect(breakpoint.connected).toBe(false);
    const disconnect = breakpoint.connect(view);
    expect(breakpoint.screens.md).toBe(false);
    match = true; callbacks[0]();
    expect(breakpoint.screens.xxxl).toBe(true);
    disconnect(); match = false; callbacks[0]();
    expect(breakpoint.screens.md).toBe(true);
    expect(breakpoint.connected).toBe(false);
    expect(listeners.size).toBe(0);
  });
});
