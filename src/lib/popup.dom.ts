import { getTooltipPosition } from './tooltip.engine';
import type { TooltipPlacement } from './tooltip.types';

const openPopups = new WeakMap<Document, HTMLElement[]>();

export function connectPopup(popup: HTMLElement, anchor: Element, options: {
  trigger?: Element;
  placement: TooltipPlacement;
  autoAdjustOverflow: boolean;
  onPlacement: (placement: TooltipPlacement) => void;
  onDismiss: (reason: 'escape' | 'outside') => void;
  preserveFocus?: boolean;
  maxWidth?: string;
  align?: 'left' | 'right' | 'top' | 'bottom';
  matchAnchorWidth?: boolean;
  gap?: number;
  onVisibilityChange?: (visible: boolean) => void;
}): () => void {
  const document = anchor.ownerDocument;
  const view = document.defaultView!;
  let frame = 0;
  let shown = false;
  let disposed = false;
  let lastPosition = '';

  function hide() {
    const stack = openPopups.get(document);
    const index = stack?.indexOf(popup) ?? -1;

    if (index !== -1) stack!.splice(index, 1);
    if (shown) options.onVisibilityChange?.(false);
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

    popup.style.maxWidth = `min(${options.maxWidth ?? 'var(--ant-tooltip-max-width)'}, ${Math.max(0, viewport.width - 16)}px)`;
    if (options.matchAnchorWidth) popup.style.minWidth = `${Math.min(rect.width, Math.max(0, viewport.width - 16))}px`;
    popup.hidden = false;

    if (!popup.matches(':popover-open')) {
      popup.showPopover();
      const stack = openPopups.get(document) ?? [];

      stack.push(popup);
      openPopups.set(document, stack);
    }

    const bounds = popup.getBoundingClientRect();
    const position = getTooltipPosition(rect, bounds, viewport, options.placement, options.autoAdjustOverflow, options.align, options.gap);
    const signature = `${position.left}:${position.top}:${position.arrowX}:${position.arrowY}:${position.placement}`;

    if (signature !== lastPosition) {
      popup.style.left = `${position.left}px`;
      popup.style.top = `${position.top}px`;
      popup.style.setProperty('--arrow-x', `${position.arrowX}px`);
      popup.style.setProperty('--arrow-y', `${position.arrowY}px`);
      options.onPlacement(position.placement);
      lastPosition = signature;
    }
    const wasShown = shown;
    shown = true;
    if (!wasShown) options.onVisibilityChange?.(true);
  }

  function tick() {
    update();
    if (!disposed) frame = view.requestAnimationFrame(tick);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (shown && openPopups.get(document)?.at(-1) === popup && event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      event.stopPropagation();
      options.onDismiss('escape');
    }
  }

  function handlePointerdown(event: PointerEvent) {
    const target = event.target;

    if (shown && target instanceof Node && !popup.contains(target) && !(options.trigger ?? anchor).contains(target)) options.onDismiss('outside');
  }

  function preserveFocus(event: PointerEvent) { event.preventDefault(); }

  // Пока поверхность открыта, отслеживаем и перемещение anchor без resize (включая бегунок).
  tick();
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('pointerdown', handlePointerdown, true);
  if (options.preserveFocus !== false) popup.addEventListener('pointerdown', preserveFocus);

  return () => {
    disposed = true;
    view.cancelAnimationFrame(frame);
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerdown, true);
    popup.removeEventListener('pointerdown', preserveFocus);
    hide();
  };
}
