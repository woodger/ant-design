import { describe, expect, it } from 'vitest';
import { getSliderDirection, getSliderKeyValue, getSliderRatio, normalizeSliderValue, resolveSliderOptions } from './slider.engine';

describe('Slider engine', () => {
  it('uses finite defaults and a positive step and collapses an inverted range', () => {
    expect(resolveSliderOptions()).toEqual({ min: 0, max: 100, step: 1 });
    expect(resolveSliderOptions({ min: NaN, max: Infinity, step: 0 })).toEqual({ min: 0, max: 100, step: 1 });
    expect(resolveSliderOptions({ min: 5, max: 2, step: -1 })).toEqual({ min: 5, max: 5, step: 1 });
  });

  it('keeps zero and uses the minimum for absent and non-finite values', () => {
    const options = resolveSliderOptions({ min: -5, max: 5 });

    expect(normalizeSliderValue(0, options)).toBe(0);
    expect(normalizeSliderValue(undefined, options)).toBe(-5);
    expect(normalizeSliderValue(NaN, options)).toBe(-5);
    expect(normalizeSliderValue(Infinity, options)).toBe(-5);
  });

  it('clamps values and snaps to the closest step relative to min with ties toward max', () => {
    const options = resolveSliderOptions({ min: 1, max: 9, step: 2 });

    expect(normalizeSliderValue(-10, options)).toBe(1);
    expect(normalizeSliderValue(10, options)).toBe(9);
    expect(normalizeSliderValue(3.8, options)).toBe(3);
    expect(normalizeSliderValue(4, options)).toBe(5);
    expect(normalizeSliderValue(0, resolveSliderOptions({ min: -1, max: 1, step: 2 }))).toBe(1);
  });

  it('keeps fractional steps and non-zero fractional origins free of arithmetic tails', () => {
    const options = resolveSliderOptions({ min: 0.1, max: 0.9, step: 0.1 });

    expect(normalizeSliderValue(0.30000000000000004, options)).toBe(0.3);
    expect(getSliderKeyValue('ArrowRight', 0.2, options, 'ltr')).toBe(0.3);
    expect(getSliderKeyValue('ArrowLeft', 0.3, options, 'ltr')).toBe(0.2);
    expect(normalizeSliderValue(0.24, resolveSliderOptions({ min: 0.05, max: 0.95, step: 0.1 }))).toBe(0.25);
  });

  it('uses only reachable steps when max is not aligned and supports a fixed range', () => {
    const options = resolveSliderOptions({ min: 0, max: 10, step: 3 });
    const fixed = resolveSliderOptions({ min: 4, max: 4 });

    expect(normalizeSliderValue(10, options)).toBe(9);
    expect(getSliderKeyValue('End', 0, options, 'ltr')).toBe(9);
    expect(normalizeSliderValue(100, fixed)).toBe(4);
    expect(getSliderRatio(4, fixed)).toBe(0);
    expect(getSliderKeyValue('ArrowRight', 4, fixed, 'ltr')).toBe(4);
  });

  it('supports exponential steps and bounds whose subtraction overflows number', () => {
    const tiny = resolveSliderOptions({ min: 0, max: 1e-6, step: 1e-7 });
    const huge = resolveSliderOptions({ min: -1e308, max: 1e308, step: 1e307 });

    expect(getSliderKeyValue('ArrowRight', 2e-7, tiny, 'ltr')).toBe(3e-7);
    expect(normalizeSliderValue(0, huge)).toBe(0);
    expect(getSliderRatio(0, huge)).toBe(0.5);
    expect(getSliderKeyValue('End', 0, huge, 'ltr')).toBe(1e308);
  });

  it('computes bounded ratios with an offset minimum', () => {
    const options = resolveSliderOptions({ min: 10, max: 30 });

    expect(getSliderRatio(10, options)).toBe(0);
    expect(getSliderRatio(15, options)).toBe(0.25);
    expect(getSliderRatio(30, options)).toBe(1);
    expect(getSliderRatio(50, options)).toBe(1);
  });

  it.each([
    ['horizontal', false, false, 'ltr'], ['horizontal', false, true, 'rtl'],
    ['horizontal', true, false, 'rtl'], ['horizontal', true, true, 'ltr'],
    ['vertical', false, false, 'btt'], ['vertical', false, true, 'btt'],
    ['vertical', true, false, 'ttb'], ['vertical', true, true, 'ttb']
  ] as const)('resolves %s reverse=%s rtl=%s as %s', (orientation, reverse, rtl, expected) => {
    expect(getSliderDirection(orientation, reverse, rtl)).toBe(expected);
  });

  it.each([
    ['ltr', 'ArrowRight', 6], ['rtl', 'ArrowRight', 4],
    ['btt', 'ArrowUp', 6], ['ttb', 'ArrowUp', 4],
    ['rtl', 'ArrowUp', 6], ['btt', 'ArrowLeft', 4]
  ] as const)('maps %s %s to the expected numeric direction', (direction, key, expected) => {
    expect(getSliderKeyValue(key, 5, resolveSliderOptions({ max: 10 }), direction)).toBe(expected);
  });

  it('supports Home, End and larger page steps and leaves unrelated keys untouched', () => {
    const options = resolveSliderOptions({ min: 0, max: 10 });

    expect(getSliderKeyValue('Home', 5, options, 'rtl')).toBe(0);
    expect(getSliderKeyValue('End', 5, options, 'rtl')).toBe(10);
    expect(getSliderKeyValue('PageUp', 5, options, 'ltr')).toBe(7);
    expect(getSliderKeyValue('PageDown', 5, options, 'ltr')).toBe(3);
    expect(getSliderKeyValue('ArrowRight', 10, options, 'ltr')).toBe(10);
    expect(getSliderKeyValue('Tab', 5, options, 'ltr')).toBeUndefined();
  });
});
