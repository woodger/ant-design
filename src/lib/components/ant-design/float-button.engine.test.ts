import { describe, expect, it } from 'vitest';
import { backTopProgress, floatButtonPlacement } from './float-button.engine';
import { scrollFrame } from './scroll.engine';

describe('FloatButton source geometry', () => {
  it('defaults invalid menu placement to top and retains explicit physical sides in RTL', () => {
    expect(floatButtonPlacement()).toBe('top'); expect(floatButtonPlacement('invalid')).toBe('top');
    for (const value of ['top', 'bottom', 'left', 'right']) expect(floatButtonPlacement(value)).toBe(value);
  });
  it('clamps overscroll and non-scrollable progress and uses available scroll height', () => {
    expect(backTopProgress(200, 1000, 200)).toBe(0.25);
    expect(backTopProgress(-10, 1000, 200)).toBe(0); expect(backTopProgress(1000, 1000, 200)).toBe(1);
    expect(backTopProgress(200, 200, 200)).toBe(0); expect(backTopProgress(0, 100, 200)).toBe(0);
  });
  it('uses the shared cubic easing with configurable BackTop duration', () => {
    expect(scrollFrame(0, 500, 0, 200)).toBe(500); expect(scrollFrame(100, 500, 0, 200)).toBe(250); expect(scrollFrame(300, 500, 0, 200)).toBe(0);
  });
});
