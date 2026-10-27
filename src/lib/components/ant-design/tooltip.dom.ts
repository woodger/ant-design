import { getTooltipPosition } from './tooltip.engine';
import type { TooltipPlacement } from './tooltip.types';

const openTooltips = new WeakMap<Document, HTMLElement[]>();

export function connectTooltipDescription(element: Element, id: string): () => void {
  function merge() {
    const tokens = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    if (!tokens.includes(id)) element.setAttribute('aria-describedby', [...tokens, id].join(' '));
  }

  merge();
  const observer = new MutationObserver(merge);
  observer.observe(element, { attributes: true, attributeFilter: ['aria-describedby'] });

  return () => {
    observer.disconnect();
    const tokens = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((token) => token && token !== id);

    if (tokens.length) element.setAttribute('aria-describedby', tokens.join(' '));
    else element.removeAttribute('aria-describedby');
  };
}

export function connectTooltipPopup(popup: HTMLElement, anchor: Element, options: {
  trigger?: Element;
  placement: TooltipPlacement;
  autoAdjustOverflow: boolean;
  onPlacement: (placement: TooltipPlacement) => void;
  onDismiss: () => void;
}): () => void {
  const document = anchor.ownerDocument;
  const view = document.defaultView!;
  let frame = 0;
  let shown = false;
  let disposed = false;
  let lastPosition = '';

  function hide() {
    const stack = openTooltips.get(document);
    const index = stack?.indexOf(popup) ?? -1;

    if (index !== -1) stack!.splice(index, 1);
    if (popup.matches(':popover-open')) popup.hidePopover();
    popup.hidden = true;
    shown = false;
  }

  function update() {
    if (disposed) return;

    const rect = anchor.getBoundingClientRect();
    const visual = view.visualViewport;
    const viewport = { x: visual?.offsetLeft ?? 0, y: visual?.offsetTop ?? 0, width: visual?.width ?? view.innerWidth, height: visual?.height ?? view.innerHeight };
    const modal = document.querySelector('dialog:modal');
    const visible = anchor.isConnected && anchor.getClientRects().length && rect.width && rect.height
      && rect.right > viewport.x && rect.left < viewport.x + viewport.width && rect.bottom > viewport.y && rect.top < viewport.y + viewport.height
      && (!modal || modal.contains(anchor));

    if (!visible) {
      hide();
      return;
    }

    popup.style.maxWidth = `min(var(--ant-tooltip-max-width), ${Math.max(0, viewport.width - 16)}px)`;
    popup.hidden = false;

    if (!popup.matches(':popover-open')) {
      popup.showPopover();
      const stack = openTooltips.get(document) ?? [];

      stack.push(popup);
      openTooltips.set(document, stack);
    }

    const bounds = popup.getBoundingClientRect();
    const position = getTooltipPosition(rect, bounds, viewport, options.placement, options.autoAdjustOverflow);
    const signature = `${position.left}:${position.top}:${position.arrowX}:${position.arrowY}:${position.placement}`;

    if (signature !== lastPosition) {
      popup.style.left = `${position.left}px`;
      popup.style.top = `${position.top}px`;
      popup.style.setProperty('--arrow-x', `${position.arrowX}px`);
      popup.style.setProperty('--arrow-y', `${position.arrowY}px`);
      options.onPlacement(position.placement);
      lastPosition = signature;
    }
    shown = true;
  }

  function tick() {
    update();
    if (!disposed) frame = view.requestAnimationFrame(tick);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (shown && openTooltips.get(document)?.at(-1) === popup && event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      event.stopPropagation();
      options.onDismiss();
    }
  }

  function handlePointerdown(event: PointerEvent) {
    const target = event.target;

    if (shown && target instanceof Node && !popup.contains(target) && !(options.trigger ?? anchor).contains(target)) options.onDismiss();
  }

  function preserveFocus(event: PointerEvent) { event.preventDefault(); }

  // Пока подсказка открыта, отслеживаем и перемещение anchor без resize (включая бегунок).
  tick();
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointerdown, true);
  popup.addEventListener('pointerdown', preserveFocus);

  return () => {
    disposed = true;
    view.cancelAnimationFrame(frame);
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerdown, true);
    popup.removeEventListener('pointerdown', preserveFocus);
    hide();
  };
}
