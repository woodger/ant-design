export function checkImageSource(source: string | undefined, document: Document, onInvalid: () => void) {
  let disposed = false;
  const probe = new document.defaultView!.Image();
  if (!source) queueMicrotask(() => { if (!disposed) onInvalid(); });
  else { probe.onerror = () => { if (!disposed) onInvalid(); }; probe.src = source; }
  return () => { disposed = true; probe.onerror = null; probe.onload = null; };
}
