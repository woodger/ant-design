export function connectPopoverTrigger(element: Element, id: string, expanded: boolean): () => void {
  const values = { 'aria-haspopup': 'dialog', 'aria-expanded': String(expanded) };
  const previous = new Map<string, string | null>();

  for (const attribute of Object.keys(values)) previous.set(attribute, element.getAttribute(attribute));

  function update() {
    for (const [attribute, value] of Object.entries(values)) {
      const current = element.getAttribute(attribute);

      if (current !== value) {
        previous.set(attribute, current);
        element.setAttribute(attribute, value);
      }
    }
    const tokens = (element.getAttribute('aria-controls') ?? '').split(/\s+/).filter(Boolean);

    if (!tokens.includes(id)) element.setAttribute('aria-controls', [...tokens, id].join(' '));
  }

  update();
  const observer = new MutationObserver(update);
  observer.observe(element, { attributes: true, attributeFilter: ['aria-controls', 'aria-haspopup', 'aria-expanded'] });

  return () => {
    observer.disconnect();
    for (const [attribute, value] of Object.entries(values)) {
      if (element.getAttribute(attribute) !== value) continue;

      const original = previous.get(attribute);

      if (original === null || original === undefined) element.removeAttribute(attribute);
      else element.setAttribute(attribute, original);
    }
    const tokens = (element.getAttribute('aria-controls') ?? '').split(/\s+/).filter((token) => token && token !== id);

    if (tokens.length) element.setAttribute('aria-controls', tokens.join(' '));
    else element.removeAttribute('aria-controls');
  };
}

export function focusPopover(popup: HTMLElement): void {
  const candidates = popup.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex], [contenteditable="true"]');

  for (const element of candidates) {
    if (element.tabIndex < 0 || element.matches(':disabled') || element.closest('[inert]') || !element.getClientRects().length) continue;

    element.focus({ preventScroll: true });
    if (popup.ownerDocument.activeElement === element) return;
  }
  popup.focus({ preventScroll: true });
}
