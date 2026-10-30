import { connectFeedbackFocus } from './feedback.dom';
import { focusAfterNotice } from './notice.dom';

export function connectStepsFocus(root: HTMLElement) {
  const document = root.ownerDocument;
  let focused: HTMLButtonElement | undefined;
  let keys: string[] = [];
  const buttons = () => [...root.querySelectorAll<HTMLButtonElement>('.ant-steps-item-trigger')];
  const available = (node: HTMLButtonElement) => !node.disabled
    && !node.closest('[inert]')
    && node.getClientRects().length > 0
    && document.defaultView!.getComputedStyle(
      node
    ).visibility === 'visible';

  function remember() {
    const node = document.activeElement;
    if (node instanceof HTMLButtonElement
      && root.contains(node)
      && node.matches(
        '.ant-steps-item-trigger'
      )) {
      focused = node;
      keys = buttons().map(button => button.dataset.stepsKey!);
    } else if (node !== document.body) {
      focused = undefined;
      keys = [];
    }
  }

  document.addEventListener('focusin', remember);
  remember();
  const observer = new document.defaultView!.MutationObserver(() => {
    if (!focused || !root.isConnected) return;
    if (document.activeElement !== document.body && document.activeElement !== focused) return;

    if (root.contains(focused) && available(focused)) {
      if (document.activeElement === document.body)
        focused.focus({ preventScroll: true });
      return;
    }

    const key = focused.dataset.stepsKey;
    const index = keys.indexOf(key!);
    const nextKeys = [...keys.slice(index + 1), ...keys.slice(0, index).reverse()];
    const candidates = buttons().filter(available);
    const next = nextKeys.map(
      candidate => candidates.find(button => button.dataset.stepsKey === candidate)
    ).find(
      Boolean
    )
      ?? candidates[0];
    focused = undefined;
    keys = [];
    if (next)
      next.focus({ preventScroll: true }); else focusAfterNotice(root, true);
  });
  observer.observe(
    root,
    {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'inert', 'hidden', 'class', 'style']
    }
  );
  // Общий механизм отвечает за unmount; observer выше сначала восстанавливает соседний шаг.
  const disconnect = connectFeedbackFocus(root);
  return () => {
    observer.disconnect();
    document.removeEventListener('focusin', remember);
    disconnect();
  };
}
