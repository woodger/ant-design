import { compute } from './vendor/compute-scroll-into-view';

// scroll-into-view-if-needed 3.1.0 standard behavior, narrowed to Anchor's options.
// MIT, see vendor/LICENSE.scroll-into-view-if-needed; git 8ac397fc9119014eae13069615b16ef4e45b3d9f.
export function revealAnchorLink(node: HTMLElement) {
  if (!node.isConnected) return;
  const style = node.ownerDocument.defaultView!.getComputedStyle(node);
  const top = parseFloat(style.scrollMarginTop) || 0;
  const bottom = parseFloat(style.scrollMarginBottom) || 0;
  const left = parseFloat(style.scrollMarginLeft) || 0;
  const right = parseFloat(style.scrollMarginRight) || 0;
  for (const action of compute(node, { scrollMode: 'if-needed', block: 'nearest' })) {
    action.el.scroll({ top: action.top - top + bottom, left: action.left - left + right });
  }
}
