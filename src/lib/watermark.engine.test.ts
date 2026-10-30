import { describe, expect, it } from 'vitest';
import { equalWatermarkKeys, getWatermarkClip, getWatermarkFont, getWatermarkLines, getWatermarkStyle } from './watermark.engine';
import type { WatermarkFont } from './watermark.types';

const font: Required<WatermarkFont> = { color: 'red', fontSize: 16, fontWeight: 400, fontStyle: 'normal', fontFamily: 'sans-serif', textAlign: 'center' };

describe('Watermark content and fonts', () => {
  it('distinguishes missing content from an empty line and merges defined per-line font values', () => {
    expect(getWatermarkLines(undefined, font)).toEqual([]);
    expect(getWatermarkLines('', font)).toEqual([{ text: '', font }]);
    const lines = getWatermarkLines(['First', { text: 'Second', font: { fontSize: undefined, color: 'blue', fontWeight: 700 } }], font);
    expect(lines[0]).toEqual({ text: 'First', font });
    expect(lines[1]).toEqual({ text: 'Second', font: { ...font, color: 'blue', fontWeight: 700 } });
    expect(font.color).toBe('red');
  });

  it('keeps the source font conversion and unscaled explicit line height', () => {
    expect(getWatermarkFont(font, 2, 30)).toBe('normal normal 400 32px/30px sans-serif');
    expect(getWatermarkFont({ ...font, fontSize: '18', fontStyle: 'italic' })).toBe('italic normal 400 18px sans-serif');
    expect(getWatermarkFont({ ...font, fontSize: '18px' })).toContain('NaNpx');
  });
});

describe('Watermark offsets', () => {
  it('starts the repeated tile at zero by default and treats offsets as physical coordinates in RTL too', () => {
    expect(getWatermarkStyle(999, [100, 100])).toMatchObject({ left: 0, top: 0, width: '100%', height: '100%', backgroundPosition: '0px 0px', pointerEvents: 'none' });
    expect(getWatermarkStyle(0, [100, 60], [0, 0])).toMatchObject({ zIndex: 0, left: 0, top: 0, backgroundPosition: '-50px -30px' });
  });

  it('reduces the overlay for positive positions and shifts only the background for negative positions', () => {
    expect(getWatermarkStyle(999, [100, 100], [200, 200])).toMatchObject({ left: '150px', top: '150px', width: 'calc(100% - 150px)', height: 'calc(100% - 150px)', backgroundPosition: '0px 0px' });
    expect(getWatermarkStyle(999, [100, 100], [-200, -200])).toMatchObject({ left: 0, top: 0, width: '100%', backgroundPosition: '-250px -250px' });
  });
});

describe('Watermark clip geometry', () => {
  it('retains alternating layout and scales the bitmap by device pixel ratio', () => {
    expect(getWatermarkClip(0, 2, 40, 20, 10, 6)).toMatchObject({ angle: 0, max: 80, left: 0, top: 20, cutWidth: 80, cutHeight: 40, width: 200, height: 52 });
    const source = getWatermarkClip(-22, 1, 200, 200, 100, 100);
    expect(Math.floor(source.width)).toBe(720);
    expect(source.cutWidth).toBeCloseTo(source.cutHeight, 10);
  });

  it('supports quarter turns and empty content without drawing negative areas', () => {
    const quarter = getWatermarkClip(90, 1, 40, 20, 10, 6);
    expect(quarter.cutWidth).toBeCloseTo(20, 10); expect(quarter.cutHeight).toBeCloseTo(40, 10);
    expect(getWatermarkClip(-22, 1, 0, 0, 100, 100)).toMatchObject({ cutWidth: 0, cutHeight: 0, width: 200, height: 100 });
  });
});

describe('Watermark singleton cache equality', () => {
  it('keeps equal immutable content and detects a changed font or geometry', () => {
    const original = [getWatermarkLines('Text', font), -22, 1, 100, 20, 100, 100];
    expect(equalWatermarkKeys(original, [getWatermarkLines('Text', font), -22, 1, 100, 20, 100, 100])).toBe(true);
    expect(equalWatermarkKeys(original, [getWatermarkLines('Text', { ...font, fontSize: 20 }), -22, 1, 100, 20, 100, 100])).toBe(false);
    expect(equalWatermarkKeys(['', 0, 1, 40, 20, 10, 6], ['', 1, 1, 40, 20, 10, 6])).toBe(false);
  });
});
