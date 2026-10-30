import { anchorScrollFrame, anchorSection, anchorTargetId } from './anchor.engine';
import type { AnchorContainer, AnchorProps } from './anchor.types';

export interface AnchorRuntimeOptions {
  getContainer: () => AnchorContainer;
  links: readonly { href: string; targetOffset?: number; }[];
  offsetTop?: number;
  targetOffset?: number;
  bounds?: number;
  getCurrentAnchor?: AnchorProps['getCurrentAnchor'];
  onChange?: AnchorProps['onChange'];
}
export function createAnchorRuntime(root: HTMLElement, notify: (href: string) => void) {
  const view = root.ownerDocument.defaultView!;
  let options: AnchorRuntimeOptions;
  let container: AnchorContainer | undefined;
  let active = true;
  let current: string | null = null;
  let raw: string | null = null;
  let animating = false;
  let frame: number | undefined;
  let generation = 0;
  function offset(node: HTMLElement, target: AnchorContainer) {
    if (!node.getClientRects().length) return 0;
    const rect = node.getBoundingClientRect();
    if (rect.width
      || rect.height) return rect.top - (target === view
        ? node.ownerDocument.documentElement.clientTop
        : (target as HTMLElement).getBoundingClientRect().top);
    return rect.top;
  }
  function setCurrent(href: string, force = false) {
    raw = href;
    const next = options.getCurrentAnchor ? options.getCurrentAnchor(href) : href;
    if (!active || (next === current && !force)) return;
    if (next !== current) {
      current = next;
      notify(next);
    }
    options.onChange?.(href);
  }
  function handleScroll() {
    if (!active || animating) return;
    const target = options.getContainer();
    if (!target) return;
    const sections = options.links.flatMap(link => {
      const id = anchorTargetId(link.href);
      const node = id ? root.ownerDocument.getElementById(id) : null;
      return node ? [{ ...link, top: offset(node, target) }] : [];
    });
    setCurrent(
      anchorSection(
        sections,
        typeof options.targetOffset === 'number' ? options.targetOffset : options.offsetTop || 0,
        options.bounds
      )
    );
  }
  function cancel() {
    generation++;
    if (frame !== undefined)
      view.cancelAnimationFrame(frame);
    frame = undefined;
    animating = false;
  }
  return {
    configure(next: AnchorRuntimeOptions) {
      if (!active) return;
      const previousMapping = options?.getCurrentAnchor;
      options = next;
      const target = options.getContainer();
      if (target !== container) {
        container?.removeEventListener('scroll', handleScroll);
        container = target;
        container?.addEventListener('scroll', handleScroll);
      }
      handleScroll();
      if (options.getCurrentAnchor && previousMapping !== options.getCurrentAnchor)
        setCurrent(raw || '');
    },
    scrollTo(href: string, targetOffset?: number) {
      if (!active) return;
      const previous = raw;
      setCurrent(href, previous !== href);
      const id = anchorTargetId(href);
      const node = id ? root.ownerDocument.getElementById(id) : null;
      if (!node || !active) return;
      if (animating && previous === href) return;
      cancel();
      const target = options.getContainer();
      if (!target) return;
      const start = target === view ? view.pageYOffset : (target as HTMLElement).scrollTop;
      const to = start + offset(node, target) - (targetOffset
        ?? options.targetOffset
        ?? options.offsetTop
        ?? 0);
      const started = Date.now();
      const ownGeneration = generation;
      animating = true;
      const step = () => {
        if (!active || generation !== ownGeneration) return;
        const elapsed = Date.now() - started;
        const top = anchorScrollFrame(elapsed, start, to);
        if (target === view)
          view.scrollTo(view.pageXOffset, top); else (target as HTMLElement).scrollTop = top;
        if (elapsed < 450)
          frame = view.requestAnimationFrame(step);
        else {
          frame = undefined;
          animating = false;
        }
      };
      frame = view.requestAnimationFrame(step);
    },
    destroy() {
      active = false;
      cancel();
      container?.removeEventListener('scroll', handleScroll);
      container = undefined;
    }
  };
}
