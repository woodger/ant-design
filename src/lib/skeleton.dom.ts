import { focusAfterNotice } from './notice.dom';

function available(node: HTMLElement): boolean {
  return node.isConnected && !node.matches(':disabled') && !node.closest('[inert]') && node.getClientRects().length > 0 && node.ownerDocument.defaultView!.getComputedStyle(node).visibility === 'visible';
}

export function createSkeletonFocus() {
  let parked: HTMLElement | undefined;
  let neighbors: HTMLElement[] = [];
  let removeListener: (() => void) | undefined;

  function clear() { removeListener?.(); removeListener = undefined; parked = undefined; neighbors = []; }

  return {
    update(host: HTMLElement, content: HTMLElement | undefined, loading: boolean) {
      if (!loading || !content?.contains(host.ownerDocument.activeElement)) return;

      clear();
      host.focus({ preventScroll: true });
      const document = host.ownerDocument;
      if (document.activeElement !== host) return;

      parked = host;
      const dialog = host.closest<HTMLDialogElement>('dialog[open]');
      const scope = dialog ?? document;
      const candidates = [...scope.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], summary, iframe, [tabindex], [contenteditable="true"]')].filter(node => node.tabIndex >= 0 && !host.contains(node));
      // Позиция соседей нужна и после удаления DOM-узла при unmount.
      neighbors = [...candidates.filter(node => host.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING), ...candidates.filter(node => host.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING).reverse(), ...(dialog ? [dialog] : [])];
      function handleFocus() { if (document.activeElement !== host && document.activeElement !== document.body) clear(); }
      document.addEventListener('focusin', handleFocus);
      removeListener = () => document.removeEventListener('focusin', handleFocus);
    },
    destroy() {
      const host = parked;
      const candidates = neighbors;
      clear();
      if (host?.isConnected) focusAfterNotice(host, host.ownerDocument.activeElement === host);
      else if (host && host.ownerDocument.activeElement === host.ownerDocument.body) candidates.find(available)?.focus({ preventScroll: true });
    }
  };
}
