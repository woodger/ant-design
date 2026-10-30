import { describe, expect, it, vi } from 'vitest';
import { layoutSiderWidth, siderMaxWidths } from './layout.engine';
import { createLayoutState } from './layout.model.svelte.js';
import { connectSiderBreakpoint } from './layout.dom';

describe('Layout sizing and registration', () => {
  it.each([[200, '200px'], ['80', '80px'], [0, '0px'], ['35%', '35%'], ['12rem', '12rem'], ['0px', '0px']])('preserves sider width %s', (value, expected) => {
    expect(layoutSiderWidth(value)).toBe(expected);
  });
  it('tracks independent nested sider registrations and ignores cleanup after destruction', () => {
    const outer = createLayoutState(); const inner = createLayoutState();
    const removeFirst = outer.register('first'); const removeSecond = outer.register('second');
    expect(outer.hasSider).toBe(true); expect(inner.hasSider).toBe(false);
    removeFirst(); expect(outer.hasSider).toBe(true);
    removeSecond(); expect(outer.hasSider).toBe(false);
    outer.destroy(); outer.register('late');
    expect(outer.hasSider).toBe(false);
  });
  it('uses the Sider.tsx xxxl threshold rather than silently replacing it with the documentation value', () => {
    expect(siderMaxWidths.xxxl).toBe('1839.98px');
  });
});

describe('Layout Sider breakpoint subscription', () => {
  it('publishes initially and on changes then detaches and ignores stale events', () => {
    let matches = false; let callback: (() => void) | undefined;
    const remove = vi.fn(); const update = vi.fn();
    const view = { matchMedia: vi.fn(() => ({ get matches() { return matches; }, addEventListener: (_: string, listener: () => void) => { callback = listener; }, removeEventListener: remove }) as unknown as MediaQueryList) };
    const stop = connectSiderBreakpoint(view, 'md', update);
    expect(view.matchMedia).toHaveBeenCalledWith('screen and (max-width: 767.98px)');
    expect(update).toHaveBeenLastCalledWith(false);
    matches = true; callback!();
    expect(update).toHaveBeenLastCalledWith(true);
    stop(); callback!();
    expect(update).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledWith('change', callback);
  });
});
