import { describe, expect, it } from 'vitest';
import { createMasonryMotion, createMasonryRuntime } from './masonry.dom';
import type { MasonryHeight } from './masonry.engine';

function setup() {
  const frames = new Map<number, FrameRequestCallback>();
  const observed = new Set<Element>();
  const published: MasonryHeight[][] = [];
  let serial = 0;
  let callback: ResizeObserverCallback;

  const view = {
    ResizeObserver: class {
      constructor(value: ResizeObserverCallback) { callback = value; }
      observe(element: Element) { observed.add(element); }
      unobserve(element: Element) { observed.delete(element); }
      disconnect() { observed.clear(); }
    },
    requestAnimationFrame(value: FrameRequestCallback) {
      frames.set(++serial, value);

      return serial;
    },
    cancelAnimationFrame(id: number) { frames.delete(id); }
  };

  function element(height: number) {
    return Object.assign(new EventTarget(), {
      ownerDocument: { defaultView: view },
      height,
      offsetWidth: 100,
      offsetHeight: height,
      getBoundingClientRect() { return { width: 100, height: this.height }; }
    });
  }

  const root = element(0);
  const node = root as unknown as HTMLDivElement;
  const runtime = createMasonryRuntime(node, next => published.push(next));

  function flush() {
    const pending = [...frames.values()];
    frames.clear();

    for (const frame of pending)
      frame(0);
  }

  return {
    element,
    root,
    node,
    runtime,
    frames,
    observed,
    published,
    flush,
    resize(target: ReturnType<typeof element>) {
      callback([{ target } as unknown as ResizeObserverEntry], {} as ResizeObserver);
    }
  };
}

describe('Masonry DOM runtime', () => {
  it('batches measurement and uses fractional DOM heights instead of item height or data', () => {
    const state = setup();
    const child = state.element(42.5);
    state.runtime.register('a', child as unknown as HTMLDivElement);
    state.runtime.configure([{ key: 'a', height: 900, data: 500 }], false, 2);
    state.runtime.collect();
    state.runtime.collect();

    expect(state.frames.size).toBe(1);

    state.flush();

    expect(state.published).toEqual([[['a', 42.5, undefined]]]);
    expect(state.observed).toEqual(new Set([state.node]));

    state.runtime.collect();
    state.flush();

    expect(state.published).toHaveLength(1);
    state.runtime.destroy();
  });

  it('observes child sizes only while fresh is enabled and ignores detached registrations', async () => {
    const state = setup();
    const child = state.element(20);
    const unregister = state.runtime.register('a', child as unknown as HTMLDivElement);
    const items = [{ key: 'a', data: 0 }];
    state.runtime.configure(items, true, 2);
    state.flush();

    expect(state.observed.has(child as unknown as Element)).toBe(true);

    child.height = 40;
    state.resize(child);
    await Promise.resolve();
    state.flush();

    expect(state.published.at(-1)).toEqual([['a', 40, undefined]]);

    state.runtime.configure(items, false, 2);
    child.height = 60;
    state.resize(child);
    await Promise.resolve();
    state.flush();

    expect(state.published.at(-1)).toEqual([['a', 40, undefined]]);
    expect(state.observed).toEqual(new Set([state.node]));

    unregister();
    state.runtime.configure(items, true, 2);

    expect(state.observed).toEqual(new Set([state.node]));
    state.runtime.destroy();
  });

  it('remeasures on load and error without emitting equal snapshots', () => {
    const state = setup();
    const child = state.element(30);
    state.runtime.register('a', child as unknown as HTMLDivElement);
    state.runtime.configure([{ key: 'a', data: 0 }], false, 2);
    state.flush();
    child.height = 50;
    state.node.dispatchEvent(new Event('load'));
    state.flush();
    child.height = 70;
    state.node.dispatchEvent(new Event('error'));
    state.flush();

    expect(state.published.map(value => value[0][1])).toEqual([30, 50, 70]);
    state.runtime.destroy();
  });

  it('cancels frames and ignores observer microtasks and events after destruction', async () => {
    const state = setup();
    state.runtime.configure([{ key: 'a', data: 0 }], true, 2);
    state.resize(state.root);
    const stale = [...state.frames.values()][0];

    state.runtime.destroy();
    await Promise.resolve();
    stale(0);
    state.resize(state.root);
    state.node.dispatchEvent(new Event('load'));
    state.node.dispatchEvent(new Event('error'));
    state.runtime.configure([{ key: 'b', data: 0 }], true, 3);
    state.runtime.register('b', state.element(80) as unknown as HTMLDivElement);
    await Promise.resolve();
    state.flush();

    expect(state.frames.size).toBe(0);
    expect(state.observed.size).toBe(0);
    expect(state.published).toEqual([]);
  });
});

describe('Masonry CSS motion lifecycle', () => {
  it('waits two frames before activation and removes a leaving element only on its own end', () => {
    const state = setup();
    const classes: string[] = [];
    const removed: boolean[] = [];
    const motion = createMasonryMotion(
      state.node,
      value => classes.push(value),
      () => removed.push(true)
    );
    motion.sync(true);

    expect(classes.at(-1)).toContain('ant-masonry-item-fade-appear-start');

    state.flush();

    expect(classes.at(-1)).toContain('ant-masonry-item-fade-appear-start');

    state.flush();
    state.node.dispatchEvent(new Event('transitionend'));

    expect(classes.at(-1)).toBe('');

    motion.sync(false);
    state.flush();
    state.flush();

    expect(classes.at(-1)).toContain('ant-masonry-item-fade-leave-active');
    expect(removed).toEqual([]);

    state.node.dispatchEvent(new Event('animationend'));

    expect(removed).toEqual([true]);
    motion.destroy();
    state.runtime.destroy();
  });

  it('revives a leaving element and cancels future activation and removal after unmount', () => {
    const state = setup();
    const classes: string[] = [];
    const removed: boolean[] = [];
    const motion = createMasonryMotion(
      state.node,
      value => classes.push(value),
      () => removed.push(true)
    );
    motion.sync(true);
    state.flush();
    state.flush();
    state.node.dispatchEvent(new Event('transitionend'));
    motion.sync(false);
    state.flush();
    motion.sync(true);
    state.flush();
    state.flush();
    state.node.dispatchEvent(new Event('transitionend'));

    expect(classes.at(-1)).toBe('');
    expect(removed).toEqual([]);

    motion.sync(false);
    const stale = [...state.frames.values()][0];
    const count = classes.length;
    motion.destroy();
    stale(0);
    state.flush();
    state.node.dispatchEvent(new Event('transitionend'));

    expect(classes).toHaveLength(count);
    expect(state.frames.size).toBe(0);
    expect(removed).toEqual([]);
    state.runtime.destroy();
  });
});
