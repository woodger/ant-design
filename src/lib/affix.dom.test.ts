import { describe, expect, it } from 'vitest';
import { createAffixRuntime } from './affix.dom';
import type { AffixPosition, AffixTarget } from './affix.types';

class TestElement extends EventTarget {
  rect = { top: 50, left: 10, width: 200.2, height: 40 };
  children: TestElement[] = [];
  ownerDocument: { defaultView: TestView; };
  constructor(view: TestView) {
    super();
    this.ownerDocument = { defaultView: view };
  }
  get offsetWidth() {
    return Math.round(this.rect.width);
  }
  get offsetHeight() {
    return Math.round(this.rect.height);
  }
  getBoundingClientRect() {
    return {
      ...this.rect,
      bottom: this.rect.top + this.rect.height,
      right: this.rect.left + this.rect.width
    };
  }
  get element() {
    return this as unknown as HTMLElement;
  }
}
class TestResizeObserver {
  constructor(readonly callback: ResizeObserverCallback) { }
  observe(_target: Element) { }
  unobserve(_target: Element) { }
  disconnect() { }
  deliver(target: TestElement) {
    this.callback(
      [{ target: target.element } as unknown as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}
class TestView extends EventTarget {
  innerHeight = 600;
  frames = new Map<number, FrameRequestCallback>();
  next = 0;
  observers: TestResizeObserver[] = [];
  ResizeObserver: typeof TestResizeObserver;
  MutationObserver = class {
    observe() { }
    disconnect() { }
  };
  constructor() {
    super();
    const observers = this.observers;
    this.ResizeObserver = class extends TestResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback);
        observers.push(this);
      }
    };
  }
  requestAnimationFrame(callback: FrameRequestCallback) {
    const id = ++this.next;
    this.frames.set(id, callback);
    return id;
  }
  cancelAnimationFrame(id: number) {
    this.frames.delete(id);
  }
  flush() {
    const callbacks = [...this.frames.values()];
    this.frames.clear();
    for (const callback of callbacks)
      callback(0);
  }
  get target() {
    return this as unknown as Window;
  }
}
function setup(onChange?: (value?: boolean) => void) {
  const view = new TestView();
  const root = new TestElement(view);
  const content = new TestElement(view);
  content.children = [new TestElement(view)];
  const positions: (AffixPosition | undefined)[] = [];
  const changes: boolean[] = [];
  const runtime = createAffixRuntime(root.element, content.element, next => {
    positions.push(next);
  }, () => value => {
    changes.push(Boolean(value));
    onChange?.(value);
  });
  runtime.configure({ target: () => view.target });
  return { view, root, positions, changes, runtime };
}

describe('Affix browser lifecycle', () => {
  it('coalesces scroll events and emits onChange only when the fixed state changes', () => {
    const { view, root, positions, changes, runtime } = setup();
    view.flush();
    root.rect.top = -1;
    view.dispatchEvent(new Event('scroll'));
    view.dispatchEvent(new Event('scroll'));

    expect(view.frames.size).toBe(1);
    view.flush();

    expect(positions.at(-1)).toMatchObject({ edge: 'top', offset: 0 });
    expect(changes).toEqual([true]);
    view.dispatchEvent(new Event('scroll'));
    view.flush();

    expect(changes).toEqual([true]);
    root.rect.top = 50;
    view.dispatchEvent(new Event('scroll'));
    view.flush();

    expect(positions.at(-1)).toBeUndefined();
    expect(changes).toEqual([true, false]);
    runtime.destroy();
  });
  it(
    'resolves a changed target during imperative update and detaches old target listeners',
    () => {
      const { view, root, positions, runtime } = setup();
      const first = new TestElement(view);
      first.rect.top = 100;
      const second = new TestElement(view);
      second.rect.top = 200;
      let target: AffixTarget = first.element;
      runtime.configure({ target: () => target, offsetTop: 5 });
      view.flush();

      expect(positions.at(-1)?.offset).toBe(105);
      target = second.element;
      runtime.updatePosition();
      view.flush();

      expect(positions.at(-1)?.offset).toBe(205);
      first.dispatchEvent(new Event('scroll'));

      expect(view.frames.size).toBe(0);
      root.rect.top = 250;
      second.dispatchEvent(new Event('scroll'));
      view.flush();

      expect(positions.at(-1)).toBeUndefined();
      runtime.destroy();
    }
  );
  it('retains the fixed state for hidden zero rectangles and temporarily null targets', () => {
    const { view, root, changes, positions, runtime } = setup();
    root.rect.top = -1;
    view.flush();
    root.rect = { top: 0, left: 0, width: 0, height: 0 };
    runtime.updatePosition();
    view.flush();

    expect(changes).toEqual([true]);
    expect(positions.at(-1)?.height).toBe(40);
    runtime.configure({ target: () => null });
    view.flush();

    expect(changes).toEqual([true]);
    root.rect = { top: 50, left: 10, width: 200, height: 40 };
    runtime.configure({ target: () => view.target });
    view.flush();

    expect(changes).toEqual([true, false]);
    runtime.destroy();
  });
  it(
    'deduplicates fractional resize noise like rc ResizeObserver but applies real size changes',
    async () => {
      const { view, root, positions, runtime } = setup();
      view.observers[0].deliver(root);
      await Promise.resolve();
      view.flush();
      root.rect.top = -1;
      view.dispatchEvent(new Event('scroll'));
      view.flush();

      expect(positions.at(-1)?.width).toBe(200.2);
      root.rect.width = 200.3;
      view.observers[0].deliver(root);
      await Promise.resolve();

      expect(view.frames.size).toBe(0);
      root.rect.width = 201.3;
      view.observers[0].deliver(root);
      await Promise.resolve();
      view.flush();

      expect(positions.at(-1)?.width).toBe(201.3);
      runtime.destroy();
    }
  );
  it(
    'cancels imperative frames independently and ignores stale frames and resize microtasks after teardown',
    async () => {
      const { view, root, positions, runtime } = setup();
      view.dispatchEvent(new Event('scroll'));
      runtime.cancel();

      expect(view.frames.size).toBe(1);
      root.rect.top = -1;
      view.flush();
      runtime.updatePosition();
      const stale = [...view.frames.values()][0];
      view.observers[0].deliver(root);
      runtime.destroy();
      stale(0);
      await Promise.resolve();
      view.dispatchEvent(new Event('scroll'));

      expect(view.frames.size).toBe(0);
      expect(positions).toHaveLength(1);
    }
  );
  it('does not publish layout after onChange synchronously disposes the owner', () => {
    let destroy: () => void;
    const fixture = setup(() => destroy());
    destroy = fixture.runtime.destroy;
    fixture.root.rect.top = -1;
    fixture.view.flush();

    expect(fixture.changes).toEqual([true]);
    expect(fixture.positions).toEqual([]);
  });
});
