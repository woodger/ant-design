import { describe, expect, it } from 'vitest';
import { formatStatisticValue } from './statistic.engine';

describe('formatStatisticValue', () => {
  it.each([
    [112893.129, 2, '-unused', { integer: '112,893', decimal: '-unused12' }],
    [-112893.129, 2, '.', { integer: '-112,893', decimal: '.12' }],
    [
      '12345678901234567890.123456789',
      undefined,
      '.',
      { integer: '12,345,678,901,234,567,890', decimal: '.123456789' }
    ],
    ['.5', 3, '.', { integer: '0', decimal: '.500' }],
    ['', undefined, '.', { integer: '0', decimal: '' }],
    ['-0.012', 0, '.', { integer: '-0', decimal: '' }],
    [12, 2, '.', { integer: '12', decimal: '.00' }],
    [-12.99, -2, '.', { integer: '-12', decimal: '' }],
    ['001234', undefined, '.', { integer: '001,234', decimal: '' }]
  ] as const)(
    'formats %s with precision %s without numeric coercion or rounding',
    (value, precision, separator, expected) => {
      expect(formatStatisticValue(value, precision, separator)).toEqual(expected);
    }
  );

  it.each(['-', '1.', '1e6', ' 123 ', '+12', 'not a number', NaN, Infinity])(
    'preserves nonnumeric or unsupported notation %s as text',
    value => {
      expect(formatStatisticValue(value)).toEqual({ text: String(value) });
    }
  );

  it('supports custom and empty separators', () => {
    expect(formatStatisticValue('1234567.89', 2, ',', ' ')).toEqual(
      { integer: '1 234 567', decimal: ',89' }
    );
    expect(formatStatisticValue('1234567.89', undefined, '', '')).toEqual(
      { integer: '1234567', decimal: '89' }
    );
  });

  it('ignores NaN precision like the upstream isNumber guard', () => {
    expect(formatStatisticValue('12.345', NaN)).toEqual({ integer: '12', decimal: '.345' });
  });
});
