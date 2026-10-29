import { getWatermarkClip, getWatermarkFont, watermarkFontGap } from './watermark.engine';
import type { WatermarkContentLine } from './watermark.types';

function prepareCanvas(document: Document, width: number, height: number, ratio = 1) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  const realWidth = width * ratio; const realHeight = height * ratio;
  canvas.setAttribute('width', `${realWidth}px`);
  canvas.setAttribute('height', `${realHeight}px`);
  context.save();
  return { context, canvas, realWidth, realHeight };
}

export function measureWatermark(context: CanvasRenderingContext2D, lines: readonly WatermarkContentLine[], image: boolean, width?: number, height?: number): readonly [number, number] {
  let defaultWidth = 120; let defaultHeight = 64;
  if (!image && context.measureText) {
    const sizes = lines.map(line => {
      context.font = getWatermarkFont(line.font);
      const metrics = context.measureText(line.text);
      return [metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent];
    });
    defaultWidth = sizes.length ? Math.ceil(Math.max(...sizes.map(size => size[0]))) : 0;
    defaultHeight = sizes.length ? Math.ceil(sizes.reduce((total, size) => total + size[1], 0)) + (sizes.length - 1) * watermarkFontGap : 0;
  }
  return [width ?? defaultWidth, height ?? defaultHeight];
}

export function drawWatermark(document: Document, content: readonly WatermarkContentLine[] | HTMLImageElement, rotate: number, ratio: number, width: number, height: number, gapX: number, gapY: number): readonly [string, number, number] | undefined {
  const original = prepareCanvas(document, width, height, ratio);
  if (!original) return;
  const { context, canvas, realWidth, realHeight } = original;

  if (!Array.isArray(content)) context.drawImage(content as HTMLImageElement, 0, 0, realWidth, realHeight);
  else {
    context.textBaseline = 'top';
    let top = 0;
    for (const { text, font } of content) {
      context.font = getWatermarkFont(font, ratio, height);
      context.fillStyle = font.color;
      context.textAlign = font.textAlign;
      context.fillText(text, realWidth / 2, top);
      top += Number(font.fontSize) * ratio + watermarkFontGap * ratio;
    }
  }

  const clip = getWatermarkClip(rotate, ratio, width, height, gapX, gapY);
  const rotated = prepareCanvas(document, Math.max(width, height), Math.max(width, height), ratio);
  if (!rotated) return;
  rotated.context.translate(clip.max / 2, clip.max / 2);
  rotated.context.rotate(clip.angle);
  if (realWidth > 0 && realHeight > 0) rotated.context.drawImage(canvas, -realWidth / 2, -realHeight / 2);

  const filled = prepareCanvas(document, clip.width, clip.height);
  if (!filled) return;
  if (clip.cutWidth > 0 && clip.cutHeight > 0) {
    for (const [x, y] of [[0, 0], [clip.cutWidth + gapX * ratio, -clip.cutHeight / 2 - gapY * ratio / 2], [clip.cutWidth + gapX * ratio, clip.cutHeight / 2 + gapY * ratio / 2]]) {
      filled.context.drawImage(rotated.canvas, clip.left, clip.top, clip.cutWidth, clip.cutHeight, x, y, clip.cutWidth, clip.cutHeight);
    }
  }
  return [filled.canvas.toDataURL(), clip.width / ratio, clip.height / ratio];
}
