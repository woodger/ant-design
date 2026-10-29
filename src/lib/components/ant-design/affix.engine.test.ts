import { describe, expect, it } from 'vitest';
import { affixPosition } from './affix.engine';

const box = { top: 0, bottom: 40, width: 200.25, height: 40 };
const viewport = { top: 0, bottom: 600 };

describe('Affix geometry', () => {
  it('defaults to top zero and retains the reference rounded-coordinate boundary', () => {
    expect(affixPosition(box, viewport, 600)).toBeUndefined();
    expect(affixPosition({ ...box, top: -0.4 }, viewport, 600)).toBeUndefined();
    expect(affixPosition({ ...box, top: -0.6 }, viewport, 600)).toEqual({ edge: 'top', offset: 0, width: 200.25, height: 40 });
  });
  it('uses the custom target top and compares a fractional offset after coordinate rounding', () => {
    expect(affixPosition({ ...box, top: 110 }, { top: 100, bottom: 300 }, 600, 10)).toBeUndefined();
    expect(affixPosition({ ...box, top: 109 }, { top: 100, bottom: 300 }, 600, 10)?.offset).toBe(110);
    expect(affixPosition({ ...box, top: 0.4 }, viewport, 600, 0.25)?.offset).toBe(0.25);
  });
  it('uses only bottom when specified and translates target bottom into viewport coordinates', () => {
    expect(affixPosition({ ...box, top: -1, bottom: 600 }, viewport, 600, undefined, 0)).toBeUndefined();
    expect(affixPosition({ ...box, bottom: 600.6 }, viewport, 600, undefined, 0)?.edge).toBe('bottom');
    expect(affixPosition({ ...box, bottom: 320 }, { top: 100, bottom: 300 }, 600, undefined, 10)).toEqual({ edge: 'bottom', offset: 310, width: 200.25, height: 40 });
  });
  it('prioritizes top when both offsets qualify and preserves zero-sized measurements', () => {
    expect(affixPosition({ ...box, top: -10, bottom: 620 }, viewport, 600, 10, 10)?.edge).toBe('top');
    expect(affixPosition({ top: -10, bottom: -10, width: 0, height: 0 }, viewport, 600)).toEqual({ edge: 'top', offset: 0, width: 0, height: 0 });
  });
});
