export function focusAfterNotice(root: HTMLElement, ownedFocus: boolean) {
  if (!ownedFocus) return;

  const document = root.ownerDocument;
  const focused = document.activeElement;
  if (focused && focused !== document.body && !root.contains(focused)) return;

  const dialog = root.closest<HTMLDialogElement>('dialog[open]');
  const scope = dialog ?? document;
  const candidates = Array.from(
    scope.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, a[href], summary, iframe, [tabindex], [contenteditable="true"]'
    )
  ).filter(
    (element) => {
      if (!(element instanceof HTMLElement)
        || root.contains(element)
        || element.tabIndex < 0
        || element.matches(
          ':disabled'
        )
        || element.closest(
          '[inert]'
        )
        || !element.getClientRects().length) return false;

      const visibility = document.defaultView!.getComputedStyle(element).visibility;
      return visibility !== 'hidden' && visibility !== 'collapse';
    }
  );
  const next = candidates.find(
    (element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
  );
  const previous = candidates.filter(
    (element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING
  ).at(
    -1
  );
  (next ?? previous ?? dialog)?.focus({ preventScroll: true });
}

export function connectNoticeSurface(
  surface: HTMLElement,
  anchor: HTMLElement,
  onVisible: (visible: boolean) => void
) {
  const document = surface.ownerDocument;
  const view = document.defaultView!;
  let frame = 0;
  let disposed = false;
  let shown = false;

  function update() {
    if (disposed) return;

    const visual = view.visualViewport;
    const modals = [...document.querySelectorAll<HTMLDialogElement>('dialog:modal')];
    // Backdrop нативного dialog возвращается hit-test как сам верхний dialog.
    const modal = modals.length
      ? document.elementFromPoint(1, 1)?.closest('dialog:modal') ?? modals.at(-1)
      : undefined;
    const owner = anchor.closest('dialog');
    const visible = document.visibilityState !== 'hidden'
      && anchor.isConnected
      && !anchor.closest(
        '[inert]'
      )
      && anchor.getClientRects().length > 0
      && view.getComputedStyle(
        anchor.parentElement ?? anchor
      ).visibility === 'visible'
      && (!owner
        || owner.open)
      && (!modal
        || modal.contains(
          anchor
        ));
    if (visible) {
      surface.style.setProperty(
        '--ant-svelte-notice-viewport-top',
        `${visual?.offsetTop ?? 0}px`
      );
      surface.style.setProperty(
        '--ant-svelte-notice-viewport-height',
        `${visual?.height ?? view.innerHeight}px`
      );
      surface.style.width = `${visual?.width ?? view.innerWidth}px`;
      surface.style.left = `${visual?.offsetLeft ?? 0}px`;
      if (!surface.matches(':popover-open'))
        surface.showPopover();
    } else if (surface.matches(':popover-open'))
      surface.hidePopover();

    if (shown !== visible) {
      shown = visible;
      onVisible(visible);
    }
  }

  function schedule() {
    if (!disposed && !frame)
      frame = view.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
  }

  const observer = new view.MutationObserver((records) => {
    if (records.some(
      ({ target }) => target instanceof Element
        && (target.matches('dialog')
          || target.contains(
            anchor
          ))
    ))
      schedule();
  });
  observer.observe(
    document.documentElement,
    {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open', 'hidden', 'inert', 'class', 'style']
    }
  );
  document.addEventListener('visibilitychange', update);
  document.addEventListener('focusin', schedule);
  view.addEventListener('resize', schedule);
  view.visualViewport?.addEventListener('resize', schedule);
  view.visualViewport?.addEventListener('scroll', schedule);
  update();
  return () => {
    disposed = true;
    view.cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', update);
    document.removeEventListener('focusin', schedule);
    view.removeEventListener('resize', schedule);
    view.visualViewport?.removeEventListener('resize', schedule);
    view.visualViewport?.removeEventListener('scroll', schedule);
    if (surface.matches(':popover-open'))
      surface.hidePopover();
    if (shown)
      onVisible(false);
  };
}

export function animateNotice(
  node: HTMLElement,
  leaving: boolean,
  from: { opacity: string; transform: string; } | undefined,
  complete: () => void,
  shift = 'translateY(-64px)'
) {
  const view = node.ownerDocument.defaultView!;
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const style = view.getComputedStyle(node);
  const token = style.getPropertyValue('--ant-motion-duration-mid').trim();
  const parsed = Number.parseFloat(token) * (token.endsWith('ms') ? 1 : 1000);
  const duration = Number.isFinite(parsed) && parsed >= 0 ? parsed : 200;
  let motion: Animation | undefined;
  let disposed = false;

  function dispose() {
    disposed = true;
    reducedMotion.removeEventListener('change', reduce);
    motion?.cancel();
    motion = undefined;
  }
  function finish() {
    if (!disposed) {
      dispose();
      complete();
    }
  }
  function reduce() {
    if (reducedMotion.matches)
      motion?.finish();
  }

  if (reducedMotion.matches || duration === 0)
    finish();
  else {
    reducedMotion.addEventListener('change', reduce);
    motion = node.animate([
      from ?? { opacity: leaving ? '1' : '0', transform: leaving ? 'none' : shift },
      { opacity: leaving ? '0' : '1', transform: leaving ? shift : 'none' }
    ], { duration, easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)', fill: 'both' });
    void motion.finished.then(finish, () => { });
  }
  return dispose;
}
