import { describe, expect, it } from 'vitest';
import {
  normalizeSkeletonRows,
  normalizeSkeletonWidth,
  resolveSkeletonLayout
} from './skeleton.engine';

describe('Skeleton layout', () => {
  it('uses the official title and three-row paragraph defaults without an avatar', () => {
    const layout = resolveSkeletonLayout();

    expect(layout.avatar).toBeUndefined();
    expect(layout.title?.width).toBe('38%');
    expect(layout.paragraph?.widths).toEqual([undefined, undefined, '61%']);
  });
  it('uses a large circular avatar, half-width title and two full rows together', () => {
    const layout = resolveSkeletonLayout({ avatar: true });

    expect(layout.avatar).toEqual({ size: 'large', shape: 'circle', width: undefined });
    expect(layout.title?.width).toBe('50%');
    expect(layout.paragraph?.widths).toEqual([undefined, undefined]);
  });
  it('uses a square avatar beside a title without a paragraph', () => {
    const layout = resolveSkeletonLayout({ avatar: true, paragraph: false });

    expect(layout.avatar?.shape).toBe('square');
    expect(layout.title?.width).toBeUndefined();
    expect(layout.paragraph).toBeUndefined();
  });
  it('supports a paragraph without a title and an avatar without text', () => {
    expect(resolveSkeletonLayout({ title: false }).paragraph?.widths).toEqual([undefined, '61%']);
    const avatar = resolveSkeletonLayout(
      { avatar: { size: 64, shape: 'square' }, title: false, paragraph: false }
    );

    expect(avatar.avatar?.width).toBe('64px');
    expect(avatar.avatar?.shape).toBe('square');
    expect(avatar.title).toBeUndefined();
    expect(avatar.paragraph).toBeUndefined();
  });
  it('applies scalar width only to the last row and accepts zero widths and zero rows', () => {
    expect(
      resolveSkeletonLayout({ title: { width: 0 }, paragraph: { rows: 3, width: 120 } })
        .paragraph
        ?.widths
    ).toEqual(
      [undefined, undefined, '120px']
    );
    expect(resolveSkeletonLayout({ title: { width: 0 } }).title?.width).toBe('0px');
    expect(resolveSkeletonLayout({ paragraph: { rows: 0 } }).paragraph?.widths).toEqual([]);
    expect(resolveSkeletonLayout({ avatar: { size: 0 } }).avatar?.width).toBe('0px');
  });
  it('assigns widths to individual rows without repeating missing array entries', () => {
    expect(
      resolveSkeletonLayout(
        { paragraph: { rows: 4, width: ['100%', 160, '  calc(100% - 2rem)  '] } }
      ).paragraph?.widths
    ).toEqual(
      ['100%', '160px', 'calc(100% - 2rem)', undefined]
    );
  });
  it.each([undefined, NaN, Infinity, -Infinity, -1])(
    'uses default rows for invalid count %s',
    (rows) => {
      expect(normalizeSkeletonRows(rows, 3)).toBe(3);
    }
  );
  it('rounds row counts down and bounds pathological allocations', () => {
    expect(normalizeSkeletonRows(2.8, 3)).toBe(2);
    expect(normalizeSkeletonRows(0, 3)).toBe(0);
    expect(normalizeSkeletonRows(Number.MAX_VALUE, 3)).toBe(1000);
  });
  it.each([undefined, NaN, Infinity, -Infinity, -1, '', '   '])(
    'uses a safe width fallback for %s',
    (width) => {
      expect(normalizeSkeletonWidth(width, '61%')).toBe('61%');
      expect(normalizeSkeletonWidth(width)).toBeUndefined();
    }
  );
  it('preserves valid CSS widths and finite nonnegative numeric widths', () => {
    expect(normalizeSkeletonWidth(' 75% ')).toBe('75%');
    expect(normalizeSkeletonWidth(42.5)).toBe('42.5px');
    expect(normalizeSkeletonWidth(0)).toBe('0px');
  });
  it('falls back to a large avatar for invalid numeric sizes', () => {
    const layout = resolveSkeletonLayout({ avatar: { size: Infinity } });

    expect(layout.avatar?.size).toBe('large');
    expect(layout.avatar?.width).toBeUndefined();
  });
});
