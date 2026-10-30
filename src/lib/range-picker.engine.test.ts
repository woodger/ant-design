import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { rangePair, rangeFlags, sameRange, orderedRange, validRange, rangeFrom } from './range-picker.engine';
describe('RangePicker source value semantics', () => {
  const start = dayjs('2026-10-10T12:30'); const end = dayjs('2026-10-20T08:30');
  it('normalizes missing boundaries to null and retains Dayjs identity', () => { expect(rangePair([start, undefined])).toEqual([start, null]); expect(rangePair(null)).toEqual([null, null]); expect(rangePair([start, end])[0]).toBe(start); expect(rangeFlags([true, false])).toEqual([true, false]); });
  it('sorts submitted boundaries by timestamp only with order enabled and no disabled field', () => {
    expect(orderedRange([end, start], true, [false, false])).toEqual([start, end]); expect(orderedRange([end, start], false, [false, false])).toEqual([end, start]); expect(orderedRange([end, start], true, [true, false])).toEqual([end, start]);
  });
  it('passes the first visited valued field as from only to the other field', () => {
    expect(rangeFrom([start, end], [1, 0], 0)).toBe(end); expect(rangeFrom([start, end], [1, 0], 1)).toBeUndefined(); expect(rangeFrom([null, end], [0, 1], 0)).toBe(end);
  });
  it('requires boundaries unless allowEmpty is set and validates endpoints rather than the interior', () => {
    expect(validRange([start, null], [false, false], true, [false, false], () => false)).toBe(false);
    expect(validRange([null, end], [true, false], true, [false, false], date => date.date() === 13)).toBe(true);
    expect(validRange([start, end], [false, false], true, [false, false], date => date.date() === 13)).toBe(true);
  });
  it('retains same-calendar-day ordering validation when sorting is disabled by a locked field', () => {
    const earlier = start.hour(1); expect(validRange([start, earlier], [false, false], true, [true, false], () => false)).toBe(true);
    expect(validRange([end, start], [false, false], true, [true, false], () => false)).toBe(false); expect(sameRange([start, end], [start.clone(), end.clone()])).toBe(true);
  });
});
