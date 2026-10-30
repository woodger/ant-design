import type { ImageTransform } from './image.types';

export function initialImageTransform(): ImageTransform { return { x: 0, y: 0, rotate: 0, scale: 1, flipX: false, flipY: false }; }
export interface ImageGeometry { width: number; height: number; offsetWidth: number; offsetHeight: number; offsetLeft: number; offsetTop: number; }

export function zoomImage(transform: ImageTransform, ratio: number, image: ImageGeometry, viewport: { width: number; height: number }, minScale: number, maxScale: number, center?: { x: number; y: number }, touch = false): ImageTransform {
  let nextRatio = ratio;
  let scale = transform.scale * ratio;
  if (scale > maxScale) { scale = maxScale; nextRatio = maxScale / transform.scale; }
  else if (scale < minScale) { scale = touch ? scale : minScale; nextRatio = scale / transform.scale; }
  const x = center?.x ?? viewport.width / 2;
  const y = center?.y ?? viewport.height / 2;
  const diff = nextRatio - 1;
  let nextX = transform.x - diff * (x - transform.x - image.offsetLeft - image.width / 2);
  let nextY = transform.y - diff * (y - transform.y - image.offsetTop - image.height / 2);
  if (ratio < 1 && scale === 1 && image.offsetWidth * scale <= viewport.width && image.offsetHeight * scale <= viewport.height) { nextX = 0; nextY = 0; }
  return { ...transform, x: nextX, y: nextY, scale };
}

export function imageWheelRatio(deltaY: number, step: number) {
  const ratio = 1 + Math.min(Math.abs(deltaY / 100), 1) * step;
  return deltaY > 0 ? 1 / ratio : ratio;
}

export function fixImagePosition(width: number, height: number, left: number, top: number, viewport: { width: number; height: number }): Partial<ImageTransform> | null {
  if (width <= viewport.width && height <= viewport.height) return { x: 0, y: 0 };
  function fix(key: 'x' | 'y', start: number, size: number, client: number) {
    const offset = (size - client) / 2;
    if (size > client) {
      if (start > 0) return { [key]: offset };
      if (start < 0 && start + size < client) return { [key]: -offset };
    } else if (start < 0 || start + size > client) return { [key]: start < 0 ? offset : -offset };
    return {};
  }
  return { ...fix('x', left, width, viewport.width), ...fix('y', top, height, viewport.height) };
}

export interface ImagePoint { x: number; y: number; }
export function imageTouchZoom(old: readonly [ImagePoint, ImagePoint], next: readonly [ImagePoint, ImagePoint]) {
  const distance = (a: ImagePoint, b: ImagePoint) => Math.hypot(a.x - b.x, a.y - b.y);
  const first = distance(old[0], next[0]); const second = distance(old[1], next[1]);
  const weight = first + second === 0 ? 0 : first / (first + second);
  const original = distance(old[0], old[1]);
  return { ratio: original ? distance(next[0], next[1]) / original : 1, center: { x: old[0].x + weight * (old[1].x - old[0].x), y: old[0].y + weight * (old[1].y - old[0].y) } };
}
