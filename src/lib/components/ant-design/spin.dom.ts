import { tick } from 'svelte';
import { focusAfterNotice } from './notice.dom';

function available(node: HTMLElement | undefined): node is HTMLElement {
  if (!node?.isConnected || node.matches(':disabled') || node.closest('[inert]') || !node.getClientRects().length) return false;

  return node.ownerDocument.defaultView!.getComputedStyle(node).visibility === 'visible';
}

export function createSpinFocus() {
  let target: HTMLElement | undefined;
  let parked: HTMLElement | undefined;
  let neighbors: HTMLElement[] = [];
  let removeListener: (() => void) | undefined;
  let version = 0;
  let active = true;

  function clearTarget() { removeListener?.(); removeListener = undefined; target = undefined; parked = undefined; neighbors = []; }

  function release(host: HTMLElement, content?: HTMLElement) {
    const current = ++version;
    const previous = target;
    void tick().then(() => {
      if (!active || current !== version) return;

      clearTarget();
      if (!available(host) || host.ownerDocument.activeElement !== host) return;

      if (content?.contains(previous ?? null) && available(previous)) previous.focus({ preventScroll: true }); else {
        const next = content ? [...content.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], summary, [tabindex], [contenteditable="true"]')].find((node) => node.tabIndex >= 0 && available(node)) : undefined;
        if (next) next.focus({ preventScroll: true }); else focusAfterNotice(host, true);
      }
    });
  }

  return {
    update(host: HTMLElement, content: HTMLElement | undefined, busy: boolean) {
      if (!active) return;

      if (!content || !busy) { if (parked) release(host, content); return; }
      version++;
      const focused = host.ownerDocument.activeElement;
      if (focused instanceof HTMLElement && content.contains(focused)) {
        clearTarget();
        target = focused;
        host.focus({ preventScroll: true });
        parked = host.ownerDocument.activeElement === host ? host : undefined;
        if (!parked) { target = undefined; return; }

        const document = host.ownerDocument;
        const dialog = host.closest<HTMLDialogElement>('dialog[open]');
        const scope = dialog ?? document;
        const candidates = [...scope.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], summary, iframe, [tabindex], [contenteditable="true"]')].filter((node) => node.tabIndex >= 0 && !host.contains(node));
        // Svelte может удалить DOM до cleanup; порядок соседей фиксируется при парковке фокуса.
        neighbors = [...candidates.filter((node) => host.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING), ...candidates.filter((node) => host.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING).reverse(), ...(dialog ? [dialog] : [])];
        function handleFocus() { if (parked && document.activeElement !== parked && document.activeElement !== document.body) { version++; clearTarget(); } }
        document.addEventListener('focusin', handleFocus);
        removeListener = () => document.removeEventListener('focusin', handleFocus);
      }
    },
    destroy() {
      active = false;
      version++;
      const host = parked;
      const candidates = neighbors;
      clearTarget();
      if (host?.isConnected) focusAfterNotice(host, host.ownerDocument.activeElement === host);
      else if (host && host.ownerDocument.activeElement === host.ownerDocument.body) candidates.find(available)?.focus({ preventScroll: true });
    }
  };
}
