import type { WatermarkContent, WatermarkContentLine, WatermarkFont } from './watermark.types';

export const watermarkFontGap = 3;

export function mergeWatermarkFont(base: Required<WatermarkFont>, override: WatermarkFont = {}): Required<WatermarkFont> {
  return { ...base, ...Object.fromEntries(Object.entries(override).filter(([, value]) => value !== undefined)) };
}

export function getWatermarkLines(content: WatermarkContent | readonly WatermarkContent[] | undefined, font: Required<WatermarkFont>): WatermarkContentLine[] {
  if (content === undefined || content === null) return [];

  return (Array.isArray(content) ? content : [content]).map(item => typeof item === 'object' && item !== null
    ? { text: item.text ?? '', font: mergeWatermarkFont(font, item.font) }
    : { text: item ?? '', font });
}

export function getWatermarkFont(font: Required<WatermarkFont>, ratio = 1, lineHeight?: number): string {
  return `${font.fontStyle} normal ${font.fontWeight} ${Number(font.fontSize) * ratio}px${lineHeight === undefined ? '' : `/${lineHeight}px`} ${font.fontFamily}`;
}

export function getWatermarkStyle(zIndex: number, gap: readonly [number, number], offset?: readonly [number, number]): Record<string, string | number> {
  let left = (offset?.[0] ?? gap[0] / 2) - gap[0] / 2;
  let top = (offset?.[1] ?? gap[1] / 2) - gap[1] / 2;
  const style: Record<string, string | number> = {
    zIndex, position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', backgroundRepeat: 'repeat'
  };

  if (left > 0) { style.left = `${left}px`; style.width = `calc(100% - ${left}px)`; left = 0; }
  if (top > 0) { style.top = `${top}px`; style.height = `calc(100% - ${top}px)`; top = 0; }
  style.backgroundPosition = `${left}px ${top}px`;
  return style;
}

export function getWatermarkStyleText(style: Record<string, string | number>): string {
  return Object.entries(style).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join(' ');
}

export function getWatermarkClip(rotate: number, ratio: number, width: number, height: number, gapX: number, gapY: number) {
  const angle = Math.PI / 180 * Number(rotate);
  const max = Math.max(width, height) * ratio;
  let left = 0; let right = 0; let top = 0; let bottom = 0;

  for (const [x, y] of [[-width, -height], [width, -height], [width, height], [-width, height]]) {
    const rx = x * ratio / 2 * Math.cos(angle) - y * ratio / 2 * Math.sin(angle);
    const ry = x * ratio / 2 * Math.sin(angle) + y * ratio / 2 * Math.cos(angle);
    left = Math.min(left, rx); right = Math.max(right, rx);
    top = Math.min(top, ry); bottom = Math.max(bottom, ry);
  }

  const cutWidth = right - left; const cutHeight = bottom - top;
  return {
    angle, max, left: left + max / 2, top: top + max / 2, cutWidth, cutHeight,
    width: (cutWidth + gapX * ratio) * 2, height: cutHeight + gapY * ratio
  };
}

export function equalWatermarkKeys(a: unknown, b: unknown, seen = new Set<unknown>()): boolean {
  if (seen.has(a)) return false;
  if (a === b) return true;
  seen.add(a);
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((item, index) => equalWatermarkKeys(item, b[index], seen));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key => equalWatermarkKeys((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], seen));
  }
  return false;
}
