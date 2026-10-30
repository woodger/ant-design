import { describe, expect, it } from 'vitest';
import { getTableFixedOffsets } from './table-layout.engine';

describe('getTableFixedOffsets', () => {
  it('accumulates actual widths independently at the start and end', () => {
    expect(getTableFixedOffsets([true, 'start', undefined, 'end', 'end'], [48, 137.5, 300, 120.25, 80])).toEqual([0, 48, undefined, 80, 0]);
  });

  it('keeps unpinned selection and data columns out of the offsets', () => {
    expect(getTableFixedOffsets([false, 'start', false, 'start', 'end'], [48, 150, 300, 80, 100])).toEqual([undefined, 0, undefined, 150, 0]);
  });

  it('uses new measured widths after a resize without rounding fractional pixels', () => {
    expect(getTableFixedOffsets(['start', 'start', 'end', 'end'], [72.125, 150, 90, 103.375])).toEqual([0, 72.125, 103.375, 0]);
  });

  it('keeps hidden or unavailable measurements finite', () => {
    expect(getTableFixedOffsets([true, true, true, 'end', 'end'], [NaN, -1, Infinity])).toEqual([0, 0, 0, 0, 0]);
  });

  it('does not pin ordinary columns or an empty table layout', () => {
    expect(getTableFixedOffsets([false, undefined], [100, 200])).toEqual([undefined, undefined]);
    expect(getTableFixedOffsets([], [])).toEqual([]);
  });
});
