import { equalMasonryData, type MasonryHeight } from './masonry.engine';
import type { MasonryItemType, MasonryKey } from './masonry.types';

/**
 * React сохраняет focus/selection вокруг DOM commit;
 * снимок нужен до записи нового keyed списка.
 */
export function captureMasonryFocus(root: HTMLDivElement) {
  const focused = root.ownerDocument.activeElement;

  if (!(focused instanceof HTMLElement) || !root.contains(focused)) return undefined;

  let selection: readonly [number, number, 'forward' | 'backward' | 'none'] | undefined;
  let editableSelection: readonly [Node, number, Node, number] | undefined;

  if (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement) {
    const { selectionStart, selectionEnd, selectionDirection } = focused;

    if (selectionStart !== null && selectionEnd !== null)
      selection = [selectionStart, selectionEnd, selectionDirection ?? 'none'];
  } else if (focused.contentEditable === 'true') {
    const range = root.ownerDocument.defaultView!.getSelection();

    if (range?.anchorNode && range.focusNode && focused.contains(range.anchorNode)
      && focused.contains(range.focusNode))
      editableSelection = [
        range.anchorNode,
        range.anchorOffset,
        range.focusNode,
        range.focusOffset
      ];
  }

  return () => {
    if (!root.isConnected || !focused.isConnected || !root.contains(focused)) return;
    if (root.ownerDocument.activeElement !== root.ownerDocument.body) return;
    if (!focused.getClientRects().length || focused.matches(':disabled') || focused.closest('[inert]')) return;
    if (root.ownerDocument.defaultView!.getComputedStyle(focused).visibility !== 'visible') return;

    focused.focus({ preventScroll: true });

    if (selection && (focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement)
      && focused.selectionStart !== null)
      focused.setSelectionRange(...selection);

    if (editableSelection) {
      const [anchor, anchorOffset, end, endOffset] = editableSelection;

      if (focused.contains(anchor) && focused.contains(end)) {
        const limit = (node: Node, offset: number) => Math.min(
          offset,
          node.nodeType === 3 ? node.nodeValue?.length ?? 0 : node.childNodes.length
        );

        root.ownerDocument.defaultView!.getSelection()?.setBaseAndExtent(
          anchor,
          limit(anchor, anchorOffset),
          end,
          limit(end, endOffset)
        );
      }
    }
  };
}

export function createMasonryRuntime<Data>(
  root: HTMLDivElement,
  publish: (heights: MasonryHeight[]) => void
) {
  const view = root.ownerDocument.defaultView!;
  const elements = new Map<MasonryKey, HTMLDivElement>();
  const observed = new Set<HTMLElement>();
  const sizes = new WeakMap<HTMLElement, readonly number[]>();
  let items: MasonryItemType<Data>[] = [];
  let snapshot: MasonryHeight[] = [];
  let fresh = false;
  let columns: number | undefined;
  let active = true;
  let frame: number | undefined;

  function collect() {
    if (!active) return;

    if (frame !== undefined)
      view.cancelAnimationFrame(frame);

    frame = view.requestAnimationFrame(() => {
      frame = undefined;

      if (!active) return;

      const next = items.map<MasonryHeight>((item, index) => {
        const key = item.key ?? index;

        return [key, elements.get(key)?.getBoundingClientRect().height ?? 0, item.column];
      });

      if (!equalMasonryData(snapshot, next)) {
        snapshot = next;
        publish(next);
      }
    });
  }

  const observer = new view.ResizeObserver(entries => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement;

      if (!active || !observed.has(target)) continue;

      const rect = target.getBoundingClientRect();
      const size = [
        Math.floor(rect.width),
        Math.floor(rect.height),
        target.offsetWidth,
        target.offsetHeight
      ];

      // Как ResizeObserver эталона: округлённый rect и offset sizes, затем отложенный callback.
      if (!equalMasonryData(sizes.get(target), size)) {
        sizes.set(target, size);
        void Promise.resolve().then(collect);
      }
    }
  });

  function observe() {
    if (!active) return;

    const targets = new Set<HTMLElement>([root]);

    if (fresh)
      for (const element of elements.values())
        targets.add(element);

    for (const target of observed) {
      if (!targets.has(target)) {
        observer.unobserve(target);
        observed.delete(target);
        sizes.delete(target);
      }
    }

    for (const target of targets) {
      if (!observed.has(target)) {
        observed.add(target);
        observer.observe(target);
      }
    }
  }

  root.addEventListener('load', collect, true);
  root.addEventListener('error', collect, true);
  observe();

  return {
    collect,
    configure(nextItems: MasonryItemType<Data>[], nextFresh: boolean, nextColumns: number) {
      if (!active) return;

      const changed = items !== nextItems || columns !== nextColumns;
      items = nextItems;
      fresh = nextFresh;
      columns = nextColumns;
      observe();

      if (changed)
        collect();
    },
    register(key: MasonryKey, element: HTMLDivElement) {
      if (!active) return () => {};

      elements.set(key, element);
      observe();

      return () => {
        if (elements.get(key) === element) {
          elements.delete(key);
          observe();
        }
      };
    },
    destroy() {
      active = false;
      observer.disconnect();
      observed.clear();
      elements.clear();
      root.removeEventListener('load', collect, true);
      root.removeEventListener('error', collect, true);

      if (frame !== undefined)
        view.cancelAnimationFrame(frame);
    }
  };
}

/** Шаги CSSMotion 1.3.3: start, два RAF, active, собственный transition/animation end. */
export function createMasonryMotion(
  node: HTMLDivElement,
  publish: (className: string) => void,
  remove: () => void
) {
  const view = node.ownerDocument.defaultView!;
  const name = 'ant-masonry-item-fade';
  let previous: boolean | undefined;
  let visible = true;
  let status: 'appear' | 'enter' | 'leave' | undefined;
  let activated = false;
  let frame: number | undefined;
  let active = true;

  function cancel() {
    if (frame !== undefined)
      view.cancelAnimationFrame(frame);

    frame = undefined;
  }

  function handleEnd(event: Event) {
    if (!active || !status || !activated || event.target !== node) return;

    cancel();
    status = undefined;
    publish('');

    if (!visible)
      remove();
  }

  node.addEventListener('transitionend', handleEnd);
  node.addEventListener('animationend', handleEnd);

  return {
    sync(next: boolean) {
      if (!active || previous === next) return;

      cancel();
      visible = next;
      status = next ? previous === undefined ? 'appear' : 'enter' : 'leave';
      previous = next;
      activated = false;
      publish(`${name}-${status} ${name}-${status}-start ${name}`);
      frame = view.requestAnimationFrame(() => {
        if (!active) return;

        frame = view.requestAnimationFrame(() => {
          frame = undefined;

          if (!active) return;

          activated = true;
          publish(`${name}-${status} ${name}-${status}-active ${name}`);
        });
      });
    },
    destroy() {
      active = false;
      cancel();
      node.removeEventListener('transitionend', handleEnd);
      node.removeEventListener('animationend', handleEnd);
    }
  };
}
