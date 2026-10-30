import { describe, expect, it } from 'vitest';
import { commitInputNumber, formatInputNumber, normalizeInputNumber, parseInputNumber, resolveInputNumberOptions, stepInputNumber } from './input-number.engine';

describe('InputNumber engine', () => {
  it.each([
    ['0', 0], ['-0', 0], ['-12.5', -12.5], ['+3', 3], ['.25', 0.25],
    ['1.', 1], [' 2.5 ', 2.5], ['1.2e-3', 0.0012], ['', null], ['  ', null]
  ] as const)('parses %j as %j', (text, value) => {
    expect(parseInputNumber(text)).toBe(value);
  });

  it.each(['-', '.', '-.', '1e', '1e-', '1,5', '1.2.3', '12px', 'Infinity', 'NaN', '1e999'])('keeps %j outside the numeric model', (text) => {
    expect(parseInputNumber(text)).toBeUndefined();
  });

  it('keeps zero and normalizes absent or non-finite owner values without producing NaN', () => {
    expect(normalizeInputNumber(0)).toBe(0);
    expect(normalizeInputNumber(-0)).toBe(0);
    expect(normalizeInputNumber(null)).toBeNull();
    expect(normalizeInputNumber(undefined)).toBeNull();
    expect(normalizeInputNumber(NaN)).toBeNull();
    expect(normalizeInputNumber(Infinity)).toBeNull();
  });

  it('uses finite bounds and a positive step and ignores invalid precision', () => {
    expect(resolveInputNumberOptions({ min: NaN, max: Infinity, step: 0, precision: -1 })).toEqual({
      min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER, step: 1, precision: undefined
    });
    expect(resolveInputNumberOptions({ step: -1, precision: 1.5 }).precision).toBeUndefined();
    expect(resolveInputNumberOptions({ precision: 101 }).precision).toBeUndefined();
    expect(resolveInputNumberOptions({ min: -2, max: 0, step: 0.1, precision: 2 })).toEqual({ min: -2, max: 0, step: 0.1, precision: 2 });
  });

  it('clamps committed values and retains an empty value', () => {
    const options = resolveInputNumberOptions({ min: -2, max: 3 });

    expect(commitInputNumber(-10, options)).toBe(-2);
    expect(commitInputNumber(10, options)).toBe(3);
    expect(commitInputNumber(0, options)).toBe(0);
    expect(commitInputNumber(null, options)).toBeNull();
  });

  it('rounds decimal ties away from zero and formats trailing zeroes', () => {
    const options = resolveInputNumberOptions({ precision: 2 });

    expect(commitInputNumber(1.005, options)).toBe(1.01);
    expect(commitInputNumber(-1.005, options)).toBe(-1.01);
    expect(formatInputNumber(1.005, 2)).toBe('1.01');
    expect(formatInputNumber(-0.001, 2)).toBe('0.00');
    expect(formatInputNumber(0, 2)).toBe('0.00');
    expect(formatInputNumber(2, 0)).toBe('2');
    expect(formatInputNumber(null, 2)).toBe('');
  });

  it('keeps rounding within positive and negative fractional boundaries', () => {
    expect(commitInputNumber(4, resolveInputNumberOptions({ min: 0, max: 3.8, precision: 0 }))).toBe(3);
    expect(commitInputNumber(2, resolveInputNumberOptions({ min: 3.2, max: 5, precision: 0 }))).toBe(4);
    expect(commitInputNumber(-4, resolveInputNumberOptions({ min: -3.8, max: 0, precision: 0 }))).toBe(-3);
    expect(commitInputNumber(-2, resolveInputNumberOptions({ min: -5, max: -3.2, precision: 0 }))).toBe(-4);
  });

  it('rejects inverted ranges and ranges containing no number at the requested precision', () => {
    const inverted = resolveInputNumberOptions({ min: 3, max: 2 });
    const fractional = resolveInputNumberOptions({ min: 0.1, max: 0.2, precision: 0 });

    expect(commitInputNumber(2, inverted)).toBeUndefined();
    expect(stepInputNumber(2, 1, inverted)).toBeNull();
    expect(commitInputNumber(0.15, fractional)).toBeUndefined();
    expect(stepInputNumber(null, 1, fractional)).toBeNull();
  });

  it('adds decimal steps without binary floating-point tails in both directions', () => {
    const options = resolveInputNumberOptions({ step: 0.1 });

    expect(stepInputNumber(0.2, 1, options)).toBe(0.3);
    expect(stepInputNumber(0.3, -1, options)).toBe(0.2);
    expect(stepInputNumber(-0.2, -1, options)).toBe(-0.3);
    expect(stepInputNumber(-0.1, 1, options)).toBe(0);
  });

  it('supports exponential notation and very small decimal steps', () => {
    const options = resolveInputNumberOptions({ step: 1e-7 });

    expect(stepInputNumber(2e-7, 1, options)).toBe(3e-7);
    expect(formatInputNumber(1e-7, 8)).toBe('0.00000010');
    expect(formatInputNumber(1e21, 2)).toBe('1000000000000000000000.00');
    expect(stepInputNumber(5e-324, 1, resolveInputNumberOptions({ step: 5e-324 }))).toBe(1e-323);
  });

  it('starts empty steps from zero, clamps at limits and blocks motion away from an exceeded bound', () => {
    const options = resolveInputNumberOptions({ min: 1, max: 5, step: 2 });

    expect(stepInputNumber(null, 1, options)).toBe(2);
    expect(stepInputNumber(null, -1, options)).toBe(1);
    expect(stepInputNumber(4, 1, options)).toBe(5);
    expect(stepInputNumber(5, 1, options)).toBeNull();
    expect(stepInputNumber(7, 1, options)).toBeNull();
    expect(stepInputNumber(7, -1, options)).toBe(5);
    expect(stepInputNumber(-3, 1, options)).toBe(1);
  });

  it('blocks steps lost at the requested precision or number resolution', () => {
    expect(stepInputNumber(2, 1, resolveInputNumberOptions({ step: 0.1, precision: 0 }))).toBeNull();
    expect(stepInputNumber(Number.MAX_SAFE_INTEGER, 1, resolveInputNumberOptions())).toBeNull();
    expect(stepInputNumber(1e20, 1, resolveInputNumberOptions({ max: 1e21 }))).toBeNull();
  });
});
