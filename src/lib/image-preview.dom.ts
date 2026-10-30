import type { ImagePreviewConfig, ImageTransform, ImageTransformAction } from './image.types';
import { fixImagePosition, imageTouchZoom, imageWheelRatio, type ImagePoint } from './image-preview.engine';

export function connectImagePreview(image: HTMLImageElement, options: {
  config: () => ImagePreviewConfig;
  transform: () => ImageTransform;
  update: (patch: Partial<ImageTransform>, action: ImageTransformAction) => void;
  zoom: (ratio: number, action: ImageTransformAction, center?: ImagePoint, touch?: boolean) => void;
  moving: (moving: boolean) => void;
}) {
  const view = image.ownerDocument.defaultView!;
  const points = new Map<number, ImagePoint>();
  let start: { x: number; y: number; diffX: number; diffY: number; type: string } | undefined;
  let previous: [ImagePoint, ImagePoint] | undefined;
  let touchFrame = 0;
  function down(event: PointerEvent) {
    if (options.config().movable === false || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    const transform = options.transform();
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.size > 1) { previous = [...points.values()].slice(0, 2) as [ImagePoint, ImagePoint]; }
    else start = { x: transform.x, y: transform.y, diffX: event.clientX - transform.x, diffY: event.clientY - transform.y, type: event.pointerType };
    image.setPointerCapture(event.pointerId);
    options.moving(true);
  }
  function move(event: PointerEvent) {
    if (!points.has(event.pointerId)) return;
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.size > 1 && previous) {
      if (!touchFrame) touchFrame = view.requestAnimationFrame(() => {
        touchFrame = 0;
        if (!previous || points.size < 2) return;
        const next = [...points.values()].slice(0, 2) as [ImagePoint, ImagePoint];
        const zoom = imageTouchZoom(previous, next);
        options.zoom(zoom.ratio, 'touchZoom', zoom.center, true);
        previous = next;
      });
    } else if (start) options.update({ x: event.clientX - start.diffX, y: event.clientY - start.diffY }, 'move');
  }
  function end(event: PointerEvent) {
    if (!points.has(event.pointerId)) return;
    points.delete(event.pointerId);
    if (image.hasPointerCapture(event.pointerId)) image.releasePointerCapture(event.pointerId);
    if (points.size) return;
    options.moving(false); previous = undefined;
    const transform = options.transform(); const old = start; start = undefined;
    const min = options.config().minScale ?? 1;
    if (event.pointerType !== 'mouse' && transform.scale < min) { options.update({ x: 0, y: 0, scale: min }, 'touchZoom'); return; }
    // Rc-image пересчитывает mouse rebound лишь при изменении обеих координат.
    if (event.pointerType === 'mouse' && old && (transform.x === old.x || transform.y === old.y)) return;
    const bounds = image.getBoundingClientRect(); const rotated = transform.rotate % 180 !== 0;
    const width = image.offsetWidth * transform.scale; const height = image.offsetHeight * transform.scale;
    const fixed = fixImagePosition(rotated ? height : width, rotated ? width : height, bounds.left, bounds.top, { width: image.ownerDocument.documentElement.clientWidth, height: view.innerHeight });
    if (fixed) options.update(fixed, 'dragRebound');
  }
  function wheel(event: WheelEvent) {
    if (options.config().wheel === false || !event.deltaY) return;
    event.preventDefault();
    options.zoom(imageWheelRatio(event.deltaY, options.config().scaleStep ?? 0.5), 'wheel', { x: event.clientX, y: event.clientY });
  }
  function doubleClick(event: MouseEvent) {
    const transform = options.transform();
    if (transform.scale !== 1) options.update({ x: 0, y: 0, scale: 1 }, 'doubleClick');
    else options.zoom(1 + (options.config().scaleStep ?? 0.5), 'doubleClick', { x: event.clientX, y: event.clientY });
  }
  image.addEventListener('pointerdown', down); image.addEventListener('pointermove', move); image.addEventListener('pointerup', end); image.addEventListener('pointercancel', end);
  image.addEventListener('wheel', wheel, { passive: false }); image.addEventListener('dblclick', doubleClick);
  return () => {
    image.removeEventListener('pointerdown', down); image.removeEventListener('pointermove', move); image.removeEventListener('pointerup', end); image.removeEventListener('pointercancel', end);
    image.removeEventListener('wheel', wheel); image.removeEventListener('dblclick', doubleClick); view.cancelAnimationFrame(touchFrame); points.clear(); options.moving(false);
  };
}


const layers = new WeakMap<Document, HTMLDialogElement[]>();
export function registerImagePreview(dialog: HTMLDialogElement) {
  const stack = layers.get(dialog.ownerDocument) ?? [];
  stack.push(dialog); layers.set(dialog.ownerDocument, stack);
  return () => { const index = stack.indexOf(dialog); if (index >= 0) stack.splice(index, 1); };
}
export function isTopImagePreview(dialog: HTMLDialogElement) { return layers.get(dialog.ownerDocument)?.at(-1) === dialog; }
