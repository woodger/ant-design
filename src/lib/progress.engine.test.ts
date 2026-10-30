import { describe, expect, it } from 'vitest';
import { getProgressCircleGeometry, normalizeProgressPercent, resolveProgressCircleSize, resolveProgressLineSize, resolveProgressStatus } from './progress.engine';

describe('Progress values and dimensions', () => {
  it.each([undefined, NaN, Infinity, -Infinity])('normalizes non-finite percent %s to zero', (value) => {
    expect(normalizeProgressPercent(value)).toBe(0);
  });
  it.each([[-12, 0], [0, 0], [42.75, 42.75], [99.99, 99.99], [100, 100], [200, 100]])('clamps percent %s to %s without rounding', (value, expected) => {
    expect(normalizeProgressPercent(value)).toBe(expected);
  });
  it('detects completion only when status is not explicitly provided', () => {
    expect(resolveProgressStatus(99.99)).toBe('normal'); expect(resolveProgressStatus(100)).toBe('success');
    for (const status of ['normal', 'exception', 'active', 'success'] as const) expect(resolveProgressStatus(100, status)).toBe(status);
  });
  it('supports preset line heights, numeric squares, dimension pairs and objects', () => {
    expect(resolveProgressLineSize()).toEqual({ width: '100%', height: 8 });
    expect(resolveProgressLineSize('small')).toEqual({ width: '100%', height: 6 });
    expect(resolveProgressLineSize(20)).toEqual({ width: '20px', height: 20 });
    expect(resolveProgressLineSize([200, 4])).toEqual({ width: '200px', height: 4 });
    expect(resolveProgressLineSize(['50%', 12])).toEqual({ width: '50%', height: 12 });
    expect(resolveProgressLineSize({ height: 3 })).toEqual({ width: '100%', height: 3 });
    expect(resolveProgressLineSize({ width: ' 12rem ' })).toEqual({ width: '12rem', height: 8 });
  });
  it('uses safe line defaults for invalid dimensions', () => {
    expect(resolveProgressLineSize([NaN, -4])).toEqual({ width: '100%', height: 8 });
    expect(resolveProgressLineSize({ width: '', height: Infinity })).toEqual({ width: '100%', height: 8 });
    expect(resolveProgressLineSize(-1)).toEqual({ width: '100%', height: 8 });
  });
  it('supports circle presets and finite positive diameters', () => {
    expect(resolveProgressCircleSize()).toBe(120); expect(resolveProgressCircleSize('small')).toBe(60);
    expect(resolveProgressCircleSize(180)).toBe(180);
    for (const value of [0, -1, Infinity, NaN]) expect(resolveProgressCircleSize(value)).toBe(120);
  });
  it('keeps the ring within its viewBox and produces quarter, empty and full arcs', () => {
    const quarter = getProgressCircleGeometry(25, 120);
    expect(quarter.strokeWidth).toBe(6); expect(quarter.radius).toBe(47);
    expect(quarter.circumference).toBeCloseTo(2 * Math.PI * 47);
    expect(quarter.offset / quarter.circumference).toBeCloseTo(0.75);
    expect(quarter.radius + quarter.strokeWidth / 2).toBe(50);
    expect(getProgressCircleGeometry(0, 120).offset).toBeCloseTo(quarter.circumference);
    expect(getProgressCircleGeometry(100, 120).offset).toBe(0);
  });
  it('keeps default small-circle strokes at least three physical pixels wide', () => {
    const result = getProgressCircleGeometry(50, 30);
    expect(result.strokeWidth).toBe(10); expect(result.strokeWidth * 30 / 100).toBe(3);
    expect(getProgressCircleGeometry(50, 60).strokeWidth).toBe(6);
  });
  it('bounds excessive strokes and keeps geometry finite for invalid values', () => {
    expect(getProgressCircleGeometry(50, 120, 12).radius).toBe(44);
    expect(getProgressCircleGeometry(50, 120, 1000).strokeWidth).toBe(99.9);
    const result = getProgressCircleGeometry(NaN, NaN, Infinity);
    expect(Object.values(result).every(Number.isFinite)).toBe(true);
    expect(result.offset).toBe(result.circumference);
  });
});
