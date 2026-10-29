import { describe, expect, it } from 'vitest';
import { drawWatermark, measureWatermark } from './watermark.draw';
import { getWatermarkLines } from './watermark.engine';
import type { WatermarkFont } from './watermark.types';

const font: Required<WatermarkFont> = { color: 'red', fontSize: 10, fontWeight: 400, fontStyle: 'normal', fontFamily: 'sans-serif', textAlign: 'center' };

function recordingCanvas() {
  const canvases: { attributes: Record<string, string>; draws: unknown[][]; text: unknown[][]; moves: number[][]; rotations: number[] }[] = [];
  const document = {
    createElement() {
      const entry = { attributes: {}, draws: [] as unknown[][], text: [] as unknown[][], moves: [] as number[][], rotations: [] as number[] };
      canvases.push(entry);
      const context = {
        font: '', fillStyle: '', textAlign: '', textBaseline: '', save() {},
        drawImage(...args: unknown[]) { entry.draws.push(args); },
        fillText(text: string, x: number, y: number) { entry.text.push([text, x, y, this.font, this.fillStyle, this.textAlign]); },
        translate(...args: number[]) { entry.moves.push(args); }, rotate(angle: number) { entry.rotations.push(angle); }
      };
      return { setAttribute(key: string, value: string) { (entry.attributes as Record<string, string>)[key] = value; }, getContext: () => context, toDataURL: () => 'data:recording' };
    }
  } as unknown as Document;
  return { document, canvases };
}

describe('Watermark canvas drawing', () => {
  it('draws independent fonts at source baselines and copies the alternating tile at DPR two', () => {
    const { document, canvases } = recordingCanvas();
    const lines = getWatermarkLines(['First', { text: 'Second', font: { fontSize: 16, color: 'blue', textAlign: 'left' } }], font);
    const result = drawWatermark(document, lines, 0, 2, 40, 20, 10, 6);

    expect(result).toEqual(['data:recording', 100, 26]);
    expect(canvases[0].attributes).toEqual({ width: '80px', height: '40px' });
    expect(canvases[0].text).toEqual([['First', 40, 0, 'normal normal 400 20px/20px sans-serif', 'red', 'center'], ['Second', 40, 26, 'normal normal 400 32px/20px sans-serif', 'blue', 'left']]);
    expect(canvases[1].moves).toEqual([[40, 40]]); expect(canvases[1].rotations).toEqual([0]);
    expect(canvases[1].draws[0].slice(1)).toEqual([-40, -20]);
    expect(canvases[2].attributes).toEqual({ width: '200px', height: '52px' });
    expect(canvases[2].draws.map(args => args.slice(1))).toEqual([
      [0, 20, 80, 40, 0, 0, 80, 40], [0, 20, 80, 40, 100, -26, 80, 40], [0, 20, 80, 40, 100, 26, 80, 40]
    ]);
  });

  it('never copies zero-sized text canvases', () => {
    const { document, canvases } = recordingCanvas();
    expect(drawWatermark(document, [], -22, 1, 0, 0, 100, 100)).toEqual(['data:recording', 200, 100]);
    expect(canvases.flatMap(canvas => canvas.draws)).toEqual([]);
  });

  it('uses font bounding boxes and keeps image defaults even for fallback text', () => {
    const context = { font: '', measureText: (text: string) => ({ width: text === 'A' ? 20.2 : 15.4, fontBoundingBoxAscent: 10, fontBoundingBoxDescent: 2 }) } as unknown as CanvasRenderingContext2D;
    const lines = getWatermarkLines(['A', 'B'], font);
    expect(measureWatermark(context, lines, false)).toEqual([21, 27]);
    expect(measureWatermark(context, lines, true)).toEqual([120, 64]);
    expect(measureWatermark(context, lines, true, 0, 30)).toEqual([0, 30]);
    expect(measureWatermark(context, [], false)).toEqual([0, 0]);
  });
});
