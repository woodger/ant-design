export function focusAfterAlert(root: HTMLElement, ownedFocus: boolean) {
  if (!ownedFocus) return;

  const document = root.ownerDocument;
  const focused = document.activeElement;
  if (focused && focused !== document.body && !root.contains(focused)) return;

  const dialog = root.closest<HTMLDialogElement>('dialog[open]');
  const scope = dialog ?? document;
  const candidates = Array.from(scope.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], summary, iframe, [tabindex], [contenteditable="true"]')).filter((element) => {
    if (!(element instanceof HTMLElement) || root.contains(element) || element.tabIndex < 0 || element.matches(':disabled') || element.closest('[inert]') || !element.getClientRects().length) return false;

    const visibility = document.defaultView!.getComputedStyle(element).visibility;
    return visibility !== 'hidden' && visibility !== 'collapse';
  });
  const next = candidates.find((element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
  const previous = candidates.filter((element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING).at(-1);
  (next ?? previous ?? dialog)?.focus({ preventScroll: true });
}

export function closeAlert(root: HTMLElement, onHidden: () => void) {
  const view = root.ownerDocument.defaultView!;
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const style = view.getComputedStyle(root);
  const token = style.getPropertyValue('--ant-motion-duration-slow').trim();
  const parsed = Number.parseFloat(token) * (token.endsWith('ms') ? 1 : 1000);
  const duration = Number.isFinite(parsed) && parsed >= 0 ? parsed : 300;
  let motion: Animation | undefined;
  let disposed = false;

  function dispose() {
    disposed = true;
    reducedMotion.removeEventListener('change', handleReducedMotion);
    motion?.cancel();
    motion = undefined;
  }

  function finish() {
    if (disposed) return;

    dispose();
    onHidden();
  }

  function handleReducedMotion() {
    if (reducedMotion.matches) motion?.finish();
  }

  if (reducedMotion.matches || duration === 0) finish();
  else {
    reducedMotion.addEventListener('change', handleReducedMotion);
    motion = root.animate([
      { height: `${root.getBoundingClientRect().height}px`, minHeight: '0px', opacity: style.opacity, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, marginTop: style.marginTop, marginBottom: style.marginBottom, borderTopWidth: style.borderTopWidth, borderBottomWidth: style.borderBottomWidth },
      { height: '0px', minHeight: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px', marginTop: '0px', marginBottom: '0px', borderTopWidth: '0px', borderBottomWidth: '0px' }
    ], { duration, easing: style.getPropertyValue('--ant-motion-ease-in-out-circ').trim() || 'cubic-bezier(0.78, 0.14, 0.15, 0.86)', fill: 'both' });
    void motion.finished.then(finish, () => {});
  }

  return dispose;
}
