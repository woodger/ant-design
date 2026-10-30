import type { MentionsProps } from './mentions.types';

// Расчёт autoSize следует calculateNodeHeight из @rc-component/input 1.3.1 (MIT).
const sizing = ['letter-spacing', 'line-height', 'font-family', 'font-weight', 'font-size', 'font-variant', 'text-rendering', 'text-transform', 'text-indent', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'border-width', 'border-style', 'box-sizing', 'word-break', 'white-space', 'overflow-wrap', 'tab-size', 'text-align', 'direction'];

export function connectMentionsMeasure(textarea: HTMLTextAreaElement, mirror: HTMLElement, autoSize: MentionsProps['autoSize'], onResize?: MentionsProps['onResize']) {
  const document = textarea.ownerDocument;
  const view = document.defaultView!;
  const previous = { height: textarea.style.height, minHeight: textarea.style.minHeight, maxHeight: textarea.style.maxHeight, overflowY: textarea.style.overflowY, resize: textarea.style.resize };
  const shadow = autoSize ? document.createElement('textarea') : undefined;
  if (shadow) {
    shadow.tabIndex = -1; shadow.setAttribute('aria-hidden', 'true'); shadow.name = 'mentions-measure'; document.body.append(shadow);
  }
  let frame = 0; let disposed = false; let width = -1; let height = -1;
  function sync() {
    if (disposed || !textarea.isConnected) return;
    const style = view.getComputedStyle(textarea);
    for (const name of sizing) mirror.style.setProperty(name, style.getPropertyValue(name));
    mirror.style.width = style.width; mirror.style.height = style.height;
    mirror.style.left = `${textarea.offsetLeft}px`; mirror.style.top = `${textarea.offsetTop}px`;
    mirror.scrollTop = textarea.scrollTop; mirror.scrollLeft = textarea.scrollLeft;
    if (shadow) {
      for (const name of sizing) shadow.style.setProperty(name, style.getPropertyValue(name));
      shadow.style.width = style.width;
      shadow.style.cssText += ';position:absolute;visibility:hidden;height:0;min-height:0;max-height:none;overflow:hidden;pointer-events:none;top:0;right:0;';
      if (textarea.wrap) shadow.wrap = textarea.wrap;
      shadow.value = textarea.value || textarea.placeholder || '';
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const borderBox = style.boxSizing === 'border-box';
      let nextHeight = shadow.scrollHeight + (borderBox ? border : -padding);
      const limits = typeof autoSize === 'object' ? autoSize : {};
      shadow.value = ' ';
      const rowHeight = shadow.scrollHeight - padding;
      const extra = borderBox ? padding + border : 0;
      if (limits.minRows !== undefined) { const min = limits.minRows * rowHeight + extra; nextHeight = Math.max(nextHeight, min); textarea.style.minHeight = `${min}px`; }
      if (limits.maxRows !== undefined) {
        const max = limits.maxRows * rowHeight + extra;
        textarea.style.maxHeight = `${max}px`; textarea.style.overflowY = nextHeight > max ? '' : 'hidden'; nextHeight = Math.min(nextHeight, max);
      }
      textarea.style.height = `${nextHeight}px`; textarea.style.resize = 'none'; mirror.style.height = view.getComputedStyle(textarea).height;
    }
    mirror.scrollTop = textarea.scrollTop; mirror.scrollLeft = textarea.scrollLeft;
    const bounds = textarea.getBoundingClientRect();
    if (bounds.width !== width || bounds.height !== height) { width = bounds.width; height = bounds.height; onResize?.({ width, height }); }
  }
  function schedule() { if (!frame) frame = view.requestAnimationFrame(() => { frame = 0; sync(); }); }
  const observer = new view.ResizeObserver(schedule);
  observer.observe(textarea);
  textarea.addEventListener('scroll', sync);
  sync();
  return {
    sync,
    destroy() {
      disposed = true; observer.disconnect(); view.cancelAnimationFrame(frame); textarea.removeEventListener('scroll', sync); shadow?.remove();
      if (autoSize) Object.assign(textarea.style, previous);
    }
  };
}
