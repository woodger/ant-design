const radios = new Map<HTMLInputElement, (checked: boolean) => void>();

function sameGroup(input: HTMLInputElement, peer: HTMLInputElement): boolean {
  return Boolean(input.name)
    && input.name === peer.name
    && input.form === peer.form
    && input.getRootNode() === peer.getRootNode();
}

export function syncRadioPeers(input: HTMLInputElement) {
  if (!input.checked) return;

  for (const [peer, update] of radios) {
    if (peer !== input && sameGroup(input, peer))
      update(peer.checked);
  }
}

export function connectRadio(input: HTMLInputElement, update: (
  checked: boolean
) => void): () => void {
  const root = input.getRootNode();

  function handleChange(event: Event) {
    const peer = event.target;

    if (peer instanceof HTMLInputElement
      && peer !== input
      && peer.type === 'radio'
      && sameGroup(
        input,
        peer
      )) {
      update(input.checked);
    }
  }

  radios.set(input, update);
  root.addEventListener('change', handleChange);

  return () => {
    root.removeEventListener('change', handleChange);
    radios.delete(input);
  };
}
