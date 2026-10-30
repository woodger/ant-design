import { describe, expect, it } from 'vitest';
import { getDrawerMotionDuration, getDrawerSize, getDrawerTransform } from './drawer.engine';

describe('Drawer dimensions', () => {
  it('resolves official presets and numeric pixel sizes', () => {
    expect(getDrawerSize()).toBe('378px');
    expect(getDrawerSize('large')).toBe('736px');
    expect(getDrawerSize(480)).toBe('480px');
    expect(getDrawerSize(320.5)).toBe('320.5px');
  });

  it('preserves custom CSS dimensions', () => {
    expect(getDrawerSize(' 50% ')).toBe('50%');
    expect(getDrawerSize('20vw')).toBe('20vw');
    expect(getDrawerSize('calc(100% - 24px)')).toBe('calc(100% - 24px)');
  });

  it('falls back for empty, nonpositive or nonfinite dimensions', () => {
    for (const size of ['', '  ', 0, -1, NaN, Infinity])
      expect(getDrawerSize(size)).toBe('378px');
  });
});

describe('Drawer motion', () => {
  it('slides off the physical edge without changing placement in RTL', () => {
    expect(getDrawerTransform('top')).toBe('translateY(-100%)');
    expect(getDrawerTransform('right')).toBe('translateX(100%)');
    expect(getDrawerTransform('bottom')).toBe('translateY(100%)');
    expect(getDrawerTransform('left')).toBe('translateX(-100%)');
  });

  it('reads seconds, milliseconds and reduced motion durations', () => {
    expect(getDrawerMotionDuration(' 0.3s ')).toBe(300);
    expect(getDrawerMotionDuration('150ms')).toBe(150);
    expect(getDrawerMotionDuration('.2s')).toBe(200);
    expect(getDrawerMotionDuration('0s')).toBe(0);
  });

  it('uses the standard duration for missing or malformed tokens', () => {
    for (const value of ['', '-1s', 'auto', 'NaNms', '0.3'])
      expect(getDrawerMotionDuration(value)).toBe(300);
  });
});
