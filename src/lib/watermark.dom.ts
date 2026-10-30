import { drawWatermark, measureWatermark } from './watermark.draw';
import { equalWatermarkKeys, getWatermarkLines, getWatermarkStyle, getWatermarkStyleText, mergeWatermarkFont } from './watermark.engine';
import type { WatermarkContentLine, WatermarkFont, WatermarkProps } from './watermark.types';

export interface WatermarkRuntimeOptions extends Pick<WatermarkProps, 'zIndex' | 'rotate' | 'width' | 'height' | 'image' | 'content' | 'font' | 'gap' | 'offset'> {
  containerStyle: string;
}

export function createWatermarkRuntime(root: HTMLDivElement, getOnRemove: () => WatermarkProps['onRemove']) {
  const document = root.ownerDocument;
  const view = document.defaultView!;
  const marks = new Map<HTMLElement, HTMLDivElement>();
  let targets = new Set<HTMLElement>([root]);
  let active = true;
  let busy = false;
  let frame: number | undefined;
  let options: WatermarkRuntimeOptions = { containerStyle: 'position:relative;overflow:hidden' };
  let font: Required<WatermarkFont> | undefined;
  let lines: WatermarkContentLine[] = [];
  let gap: readonly [number, number] = [100, 100];
  let markStyle: Record<string, string | number> = {};
  let input: unknown;
  let cacheKeys: unknown;
  let cache: readonly [string, number, number] | undefined;
  let data: readonly [string, number, number] | undefined;
  const intendedStyle = document.createElement('div').style;
  const pendingImages = new Set<HTMLImageElement>();

  function append(holder: HTMLElement) {
    if (!active || !data || !targets.has(holder)) return;
    const existing = marks.get(holder);
    const mark = existing ?? document.createElement('div');
    marks.set(holder, mark);
    const style = getWatermarkStyleText({ ...markStyle, backgroundImage: `url('${data[0]}')`, backgroundSize: `${Math.floor(data[1])}px`, visibility: 'visible !important' });
    if (mark.getAttribute('style') !== style) mark.setAttribute('style', style);
    mark.removeAttribute('class'); mark.removeAttribute('hidden');
    mark.setAttribute('aria-hidden', 'true');
    if (mark.parentElement !== holder) {
      if (existing) getOnRemove()?.();
      // OnRemove может синхронно удалить holder или весь компонент.
      if (active && targets.has(holder)) holder.append(mark);
    }
  }

  function render() {
    if (!active || busy) return;
    busy = true;
    frame = view.requestAnimationFrame(() => { frame = undefined; busy = false; });
    const context = document.createElement('canvas').getContext('2d');
    if (!context) return;
    const current = options;
    const currentLines = lines;
    const ratio = view.devicePixelRatio || 1;
    const [width, height] = measureWatermark(context, currentLines, Boolean(current.image), current.width, current.height);
    const [gapX, gapY] = gap;
    const rotate = current.rotate ?? -22;

    function draw(content: readonly WatermarkContentLine[] | HTMLImageElement) {
      if (!active) return;
      // Как useSingletonCache: HTMLElement и top-level NaN исключаются из ключей.
      const keys = [Array.isArray(content) ? content : '', rotate, ratio, width, height, gapX, gapY]
        .map(value => typeof value === 'number' && Number.isNaN(value) ? '' : value);
      if (!cache || !equalWatermarkKeys(cacheKeys, keys)) {
        cacheKeys = keys;
        cache = drawWatermark(document, content, rotate, ratio, width, height, gapX, gapY);
      }
      data = cache;
      for (const holder of targets) append(holder);
    }

    if (current.image) {
      const image = new view.Image();
      pendingImages.add(image);
      const finish = (valid: boolean) => {
        image.onload = null; image.onerror = null; pendingImages.delete(image);
        draw(valid ? image : currentLines);
      };
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.crossOrigin = 'anonymous'; image.referrerPolicy = 'no-referrer';
      image.src = current.image;
    } else draw(currentLines);
  }

  const observer = typeof view.MutationObserver === 'function' ? new view.MutationObserver(records => {
    for (const record of records) {
      const owned = (node: Node) => [...marks.values()].includes(node as HTMLDivElement);
      if ([...record.removedNodes].some(owned) || record.type === 'attributes' && owned(record.target)) render();
      else if (record.target === root && record.attributeName === 'style') {
        for (const property of ['position', 'overflow']) {
          const expected = intendedStyle.getPropertyValue(property);
          const priority = intendedStyle.getPropertyPriority(property);
          if (expected && (root.style.getPropertyValue(property) !== expected || root.style.getPropertyPriority(property) !== priority)) root.style.setProperty(property, expected, priority);
        }
      }
    }
  }) : undefined;

  function observe() {
    observer?.takeRecords(); observer?.disconnect();
    for (const holder of targets) observer?.observe(holder, { subtree: true, childList: true, attributeFilter: ['style', 'class'] });
  }

  function remove(holder: HTMLElement) {
    const mark = marks.get(holder);
    if (mark?.parentElement === holder) mark.remove();
    marks.delete(holder);
  }

  observe();

  return {
    configure(next: WatermarkRuntimeOptions, panels: ReadonlySet<HTMLElement>) {
      if (!active) return;
      options = next;
      intendedStyle.cssText = next.containerStyle;
      const computed = view.getComputedStyle(root);
      const number = (name: string, fallback: number) => {
        const value = Number.parseFloat(computed.getPropertyValue(name));
        return Number.isFinite(value) ? value : fallback;
      };
      const nextFont = mergeWatermarkFont({ color: computed.getPropertyValue('--ant-color-fill').trim() || 'rgba(0,0,0,0.15)', fontSize: number('--ant-font-size-lg', 16), fontWeight: 400, fontStyle: 'normal', fontFamily: 'sans-serif', textAlign: 'center' }, next.font);
      if (!font || Object.keys(nextFont).some(key => !Object.is(nextFont[key as keyof WatermarkFont], font![key as keyof WatermarkFont]))) font = nextFont;
      lines = getWatermarkLines(next.content, font);
      gap = [next.gap?.[0] ?? 100, next.gap?.[1] ?? 100];
      const zIndex = next.zIndex ?? number('--ant-z-index-popup-base', 1000) - 1;
      markStyle = getWatermarkStyle(zIndex, gap, next.offset);

      const nextTargets = new Set([root, ...panels]);
      const changedTargets = targets.size !== nextTargets.size || [...targets].some(holder => !nextTargets.has(holder));
      const added = [...nextTargets].filter(holder => !targets.has(holder));
      for (const holder of targets) if (!nextTargets.has(holder)) remove(holder);
      targets = nextTargets;
      if (changedTargets) observe();
      for (const holder of added) append(holder);

      const nextInput = [next.rotate ?? -22, zIndex, next.width, next.height, next.image, lines, ...gap, next.offset?.[0] ?? gap[0] / 2, next.offset?.[1] ?? gap[1] / 2];
      if (!equalWatermarkKeys(input, nextInput)) { input = nextInput; render(); }
    },
    remove(holder: HTMLElement) { if (active) remove(holder); },
    destroy() {
      if (!active) return;
      active = false;
      observer?.takeRecords(); observer?.disconnect();
      if (frame !== undefined) view.cancelAnimationFrame(frame);
      for (const image of pendingImages) { image.onload = null; image.onerror = null; }
      pendingImages.clear();
      for (const holder of targets) remove(holder);
      targets.clear(); cache = undefined; data = undefined;
    }
  };
}
