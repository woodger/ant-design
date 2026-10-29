import { buttonTwoCN } from './button.engine';

export function connectButtonText(content: HTMLElement, getEnabled: () => boolean, notify: (twoCN: boolean) => void) {
  let active = true;
  const refresh = () => {
    if (!active) return;
    const children = [...content.childNodes].filter(node => node.nodeType === 1 || node.nodeType === 3 && node.textContent !== '');
    notify(getEnabled() && children.length === 1 && buttonTwoCN(content.textContent ?? ''));
  };
  const observer = new content.ownerDocument.defaultView!.MutationObserver(refresh);
  observer.observe(content, { childList: true, subtree: true, characterData: true });
  refresh();
  return { refresh, destroy() { active = false; observer.disconnect(); } };
}
