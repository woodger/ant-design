import { tick } from 'svelte';
import { focusAfterNotice } from './notice.dom';

const focusable = 'button, input, select, textarea, a[href], summary, iframe, [tabindex], [contenteditable="true"]';

function available(node: HTMLElement): boolean {
  return node.isConnected && node.tabIndex >= 0 && !node.matches(':disabled') && !node.closest('[inert]') && node.getClientRects().length > 0 && node.ownerDocument.defaultView!.getComputedStyle(node).visibility === 'visible';
}

export function connectEmptyFocus(host: HTMLElement) {
  const document = host.ownerDocument;
  let target: HTMLElement | undefined;
  let neighbors: HTMLElement[] = [];

  function remember() {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && host.contains(focused)) {
      target = focused;
      const dialog = host.closest<HTMLDialogElement>('dialog[open]');
      const candidates = [...(dialog ?? document).querySelectorAll<HTMLElement>(focusable)].filter(node => node.tabIndex >= 0 && !host.contains(node));
      neighbors = [...candidates.filter(node => host.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING), ...candidates.filter(node => host.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING).reverse(), ...(dialog ? [dialog] : [])];
    } else if (focused !== document.body) { target = undefined; neighbors = []; }
  }

  function recover(candidates: HTMLElement[]) {
    if (document.activeElement && document.activeElement !== document.body) return;

    if (host.isConnected) {
      const next = [...host.querySelectorAll<HTMLElement>(focusable)].find(available);
      if (next) next.focus({ preventScroll: true }); else focusAfterNotice(host, true);
    } else candidates.find(node => available(node) || node instanceof HTMLDialogElement && node.open && node.getClientRects().length > 0)?.focus({ preventScroll: true });
  }

  document.addEventListener('focusin', remember);
  remember();
  const observer = new host.ownerDocument.defaultView!.MutationObserver(() => {
    if (!target || host.contains(target) || !host.isConnected) return;

    const candidates = neighbors;
    target = undefined; neighbors = [];
    recover(candidates);
  });
  observer.observe(host, { childList: true, subtree: true });
  return () => {
    document.removeEventListener('focusin', remember);
    observer.disconnect();
    const owned = Boolean(target);
    const candidates = neighbors;
    target = undefined; neighbors = [];
    // Владелец может выбрать новый control после обновления данных в том же tick.
    if (owned) void tick().then(() => recover(candidates));
  };
}
