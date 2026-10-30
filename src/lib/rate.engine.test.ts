import { describe, expect, it } from 'vitest';
import { getRateKeyValue, getRatePointerValue, getRateStarClass } from './rate.engine';

describe('Rate pointer values', () => {
  it('uses strict midpoint boundaries and reverses only the half hit area in RTL', () => {
    expect([109, 110, 111].map(x => getRatePointerValue(2, x, 100, 20, true, false))).toEqual(
      [2.5, 3, 3]
    );
    expect([109, 110, 111].map(x => getRatePointerValue(2, x, 100, 20, true, true))).toEqual(
      [3, 3, 2.5]
    );
  });

  it('uses full values for keyboard selection and when halves are disabled', () => {
    expect(getRatePointerValue(3, undefined, 100, 20, true, false)).toBe(4);
    expect(getRatePointerValue(3, NaN, 100, 20, true, false)).toBe(4);
    expect(getRatePointerValue(3, 101, 100, 20, false, false)).toBe(4);
  });
});

describe('Rate keyboard values', () => {
  it('increments and decrements by the configured step and reverses arrows in RTL', () => {
    expect(getRateKeyValue(2, 5, false, 'ArrowRight', false)).toBe(3);
    expect(getRateKeyValue(2, 5, false, 'ArrowLeft', false)).toBe(1);
    expect(getRateKeyValue(2, 5, true, 'ArrowLeft', true)).toBe(2.5);
    expect(getRateKeyValue(2, 5, true, 'ArrowRight', true)).toBe(1.5);
  });

  it(
    'ignores exhausted boundaries, vertical arrows, Home and released controlled values',
    () => {
      expect(getRateKeyValue(5, 5, true, 'ArrowRight', false)).toBeUndefined();
      expect(getRateKeyValue(0, 5, false, 'ArrowLeft', false)).toBeUndefined();
      expect(getRateKeyValue(2, 5, true, 'ArrowUp', false)).toBeUndefined();
      expect(getRateKeyValue(2, 5, true, 'Home', false)).toBeUndefined();
      expect(getRateKeyValue(undefined, 5, false, 'ArrowRight', false)).toBeUndefined();
    }
  );

  it(
    'preserves source arithmetic without rounding or clamping an externally supplied fraction',
    () => {
      expect(getRateKeyValue(4.8, 5, true, 'ArrowRight', false)).toBe(5.3);
      expect(getRateKeyValue(0.2, 5, true, 'ArrowLeft', false)).toBe(-0.3);
    }
  );
});

describe('Rate star presentation', () => {
  it('fills complete stars and highlights only a permitted final half', () => {
    expect(getRateStarClass(1, 2.5, true, false)).toBe('ant-rate-star ant-rate-star-full');
    expect(getRateStarClass(2, 2.5, true, false)).toBe(
      'ant-rate-star ant-rate-star-half ant-rate-star-active'
    );
    expect(getRateStarClass(2, 2.5, false, false)).toBe('ant-rate-star ant-rate-star-zero');
    expect(getRateStarClass(2, 2.1, true, false)).toBe('ant-rate-star ant-rate-star-zero');
  });

  it('retains the source focus classes for zero, exact and half values', () => {
    expect(getRateStarClass(0, 0, false, true)).toBe('ant-rate-star ant-rate-star-focused');
    expect(getRateStarClass(1, 2, false, true)).toBe(
      'ant-rate-star ant-rate-star-full ant-rate-star-focused'
    );
    expect(getRateStarClass(2, 2.5, true, true)).toBe(
      'ant-rate-star ant-rate-star-half ant-rate-star-active ant-rate-star-focused'
    );
    expect(getRateStarClass(0, undefined, false, true)).toBe('ant-rate-star ant-rate-star-zero');
  });
});
