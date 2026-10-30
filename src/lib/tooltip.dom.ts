export function connectTooltipDescription(element: Element, id: string): () => void {
  function merge() {
    const tokens = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

    if (!tokens.includes(id))
      element.setAttribute('aria-describedby', [...tokens, id].join(' '));
  }

  merge();
  const observer = new MutationObserver(merge);
  observer.observe(element, { attributes: true, attributeFilter: ['aria-describedby'] });

  return () => {
    observer.disconnect();
    const tokens = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(
      (token) => token && token !== id
    );

    if (tokens.length)
      element.setAttribute('aria-describedby', tokens.join(' '));
    else element.removeAttribute('aria-describedby');
  };
}
