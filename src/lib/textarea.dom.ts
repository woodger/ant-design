import type { TextAreaProps } from './textarea.types';

const sizing = [
  'letter-spacing',
  'line-height',
  'padding-top',
  'padding-bottom',
  'font-family',
  'font-weight',
  'font-size',
  'font-variant',
  'text-rendering',
  'text-transform',
  'width',
  'text-indent',
  'padding-left',
  'padding-right',
  'border-width',
  'box-sizing',
  'word-break',
  'white-space'
];
const shadows = new WeakMap<Document, { node: HTMLTextAreaElement; users: number; }>();

export { inputChangeEvent as textAreaChangeEvent } from './input-event.dom';

export function createTextAreaMeasure(
  element: HTMLTextAreaElement,
  notify: (size: { width: number; height: number; }) => void
) {
  const document = element.ownerDocument;
  const view = document.defaultView!;
  let shadow: { node: HTMLTextAreaElement; users: number; } | undefined;
  let autoSize: TextAreaProps['autoSize'];
  let active = true;
  let frame = 0;
  let previous = [-1, -1, -1, -1];
  let authored = '';

  function release() {
    if (shadow && --shadow.users === 0) {
      shadow.node.remove();
      shadows.delete(document);
    }
    shadow = undefined;
  }

  function sync() {
    if (!active || !element.isConnected) return;
    if (autoSize && shadow) {
      const style = view.getComputedStyle(element);
      const node = shadow.node;
      node
        .style
        .cssText = sizing.map(name => `${name}:${style.getPropertyValue(name)}`).join(
          ';'
        ) + ';min-height:0!important;max-height:none!important;height:0!important;visibility:hidden!important;overflow:hidden!important;position:absolute!important;z-index:-1000!important;top:0!important;right:0!important;pointer-events:none!important';
      const wrap = element.getAttribute('wrap');
      if (wrap)
        node.setAttribute('wrap', wrap); else node.removeAttribute('wrap');
      node.value = element.value || element.placeholder || '';
      const padding = parseFloat(style.paddingBottom) + parseFloat(style.paddingTop);
      const border = parseFloat(style.borderBottomWidth) + parseFloat(style.borderTopWidth);
      const box = style.boxSizing;
      let height = node.scrollHeight + (box === 'border-box'
        ? border
        : box === 'content-box' ? -padding : 0);
      const limits = typeof autoSize === 'object' ? autoSize : {};
      let min: number | undefined;
      let max: number | undefined;
      let overflow = '';
      if (limits.minRows !== undefined || limits.maxRows !== undefined) {
        node.value = ' ';
        const row = node.scrollHeight - padding;
        const extra = box === 'border-box' ? padding + border : 0;
        if (limits.minRows !== undefined) {
          min = row * limits.minRows + extra;
          height = Math.max(min, height);
        }
        if (limits.maxRows !== undefined) {
          max = row * limits.maxRows + extra;
          overflow = height > max ? '' : 'hidden';
          height = Math.min(max, height);
        }
      }
      element.style.height = `${height}px`;
      element.style.overflowY = overflow;
      element.style.resize = 'none';
      if (min)
        element.style.minHeight = `${min}px`;
      if (max)
        element.style.maxHeight = `${max}px`;
    }
    const bounds = element.getBoundingClientRect();
    const dimensions = [
      Math.floor(bounds.width),
      Math.floor(bounds.height),
      element.offsetWidth,
      element.offsetHeight
    ];
    if (dimensions.some((value, index) => value !== previous[index])) {
      previous = dimensions;
      notify({ width: dimensions[0], height: dimensions[1] });
    }
  }

  function schedule() {
    if (active && !frame)
      frame = view.requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
  }
  const observer = new view.ResizeObserver(schedule);
  observer.observe(element);

  return {
    configure(next: TextAreaProps['autoSize'], style: string) {
      if (!active) return;
      // Сбрасываем только собственные autoSize-поля к authored styles перед новым измерением.
      if (autoSize || next)
        element.style.cssText = style;
      authored = style;
      autoSize = next;
      if (!next)
        release();
      else if (!shadow) {
        shadow = shadows.get(document);
        if (!shadow) {
          const node = document.createElement('textarea');
          node.tabIndex = -1;
          node.setAttribute('aria-hidden', 'true');
          node.name = 'hiddenTextarea';
          document.body.append(node);
          shadow = { node, users: 0 };
          shadows.set(document, shadow);
        }
        shadow.users++;
      }
      sync();
    },
    sync,
    destroy() {
      active = false;
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      if (autoSize)
        element.style.cssText = authored;
      release();
    }
  };
}
