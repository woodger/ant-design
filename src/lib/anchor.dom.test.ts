import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAnchorRuntime } from './anchor.dom';
import type { AnchorContainer } from './anchor.types';

class Container extends EventTarget {
  scrollTop = 0;
  top = 100;
  getBoundingClientRect() {
    return { top: this.top };
  }
  get target() {
    return this as unknown as HTMLElement;
  }
}
function setup() {
  vi.useFakeTimers();
  let next = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const container = new Container();
  const nodes = new Map<string, { top: number; hidden?: boolean; }>(
    [['one', { top: 0 }], ['two', { top: 200 }], ['three', { top: 400 }]]
  );
  const view = new EventTarget() as EventTarget & {
    pageYOffset: number;
    pageXOffset: number;
    scrollTo: ReturnType<typeof vi.fn>;
    requestAnimationFrame: (fn: FrameRequestCallback) => number;
    cancelAnimationFrame: (id: number) => void;
  };
  Object.assign(view, {
    pageYOffset: 0,
    pageXOffset: 7,
    scrollTo: vi.fn((_x: number, y: number) => {
      view.pageYOffset = y;
    }),
    requestAnimationFrame: (fn: FrameRequestCallback) => {
      const id = ++next;
      frames.set(id, fn);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
    }
  });
  const ownerDocument = {
    defaultView: view,
    documentElement: { clientTop: 2 },
    getElementById: (id: string) => {
      const node = nodes.get(id);
      return node
        ? {
          ownerDocument,
          getClientRects: () => node.hidden ? [] : [{}],
          getBoundingClientRect: () => ({
            top: node.top - container.scrollTop + container.top,
            width: 100,
            height: 100
          })
        }
        : null;
    }
  };
  const root = { ownerDocument } as unknown as HTMLElement;
  const values: string[] = [];
  const changes: string[] = [];
  const runtime = createAnchorRuntime(root, value => {
    values.push(value);
  });
  const options = {
    getContainer: () => container.target as AnchorContainer,
    links: [{ href: '#one' }, { href: '#two', targetOffset: 40 }, { href: '#three' }],
    onChange: (value: string) => {
      changes.push(value);
    }
  };
  const flush = (ms = 450) => {
    vi.advanceTimersByTime(ms);
    const pending = [...frames.values()];
    frames.clear();
    for (const fn of pending)
      fn(0);
  };
  runtime.configure(options);
  return { runtime, container, view, frames, nodes, values, changes, options, flush };
}
afterEach(() => {
  vi.useRealTimers();
});

describe('Anchor DOM runtime', () => {
  it('tracks scroll using link offsets, changes targets and removes old listeners', () => {
    const { runtime, container, values, changes, options } = setup();

    expect(values).toEqual(['#one']);
    container.scrollTop = 160;
    container.dispatchEvent(new Event('scroll'));

    expect(values.at(-1)).toBe('#two');
    container.dispatchEvent(new Event('scroll'));

    expect(changes).toEqual(['#one', '#two']);
    const other = new Container();
    other.top = 500;
    runtime.configure({ ...options, getContainer: () => other.target });
    const count = changes.length;
    container.scrollTop = 400;
    container.dispatchEvent(new Event('scroll'));

    expect(changes).toHaveLength(count);
    runtime.destroy();
    other.dispatchEvent(new Event('scroll'));

    expect(changes).toHaveLength(count);
  });
  it('maps visual state once while callbacks retain raw href and deduplicate scrolling', () => {
    const { runtime, container, changes, values, options, flush } = setup();
    runtime.configure({ ...options, getCurrentAnchor: () => '#three' });
    const initial = changes.length;
    runtime.scrollTo('#two');

    expect(values.at(-1)).toBe('#three');
    expect(changes.at(-1)).toBe('#two');
    expect(changes).toHaveLength(initial + 1);
    container.dispatchEvent(new Event('scroll'));

    expect(changes).toHaveLength(initial + 1);
    runtime.scrollTo('#three');

    expect(changes.at(-1)).toBe('#three');
    flush();
    const count = changes.length;
    container.dispatchEvent(new Event('scroll'));
    container.dispatchEvent(new Event('scroll'));

    expect(changes).toHaveLength(count);
    runtime.destroy();
  });
  it(
    'uses per-link, global and top offsets and ignores a repeated click during animation',
    () => {
      const { runtime, container, frames, options, flush } = setup();
      runtime.configure({ ...options, offsetTop: 10, targetOffset: 20 });
      runtime.scrollTo('#two', 50);
      const first = [...frames.keys()];
      runtime.scrollTo('#two', 50);

      expect([...frames.keys()]).toEqual(first);
      flush();

      expect(container.scrollTop).toBe(150);
      runtime.scrollTo('#three');
      flush();

      expect(container.scrollTop).toBe(380);
      runtime.configure({ ...options, offsetTop: 10 });
      runtime.scrollTo('#one');
      flush();

      expect(container.scrollTop).toBe(-10);
      runtime.destroy();
    }
  );
  it('cancels a superseded animation and ignores stale frames after destroy', () => {
    const { runtime, container, frames, flush } = setup();
    runtime.scrollTo('#two');
    const stale = [...frames.values()][0];
    runtime.scrollTo('#three');
    stale(0);

    expect(container.scrollTop).toBe(0);
    flush(225);

    expect(container.scrollTop).toBe(200);
    const pending = [...frames.values()][0];
    runtime.destroy();
    pending(0);

    expect(container.scrollTop).toBe(200);
    expect(frames.size).toBe(0);
  });
  it('waits for a parent container ref before measuring or listening', () => {
    const { runtime, container, changes, options } = setup();
    runtime.configure(
      { ...options, getContainer: () => undefined as unknown as AnchorContainer }
    );
    const count = changes.length;
    container.scrollTop = 400;
    container.dispatchEvent(new Event('scroll'));

    expect(changes).toHaveLength(count);
    runtime.configure(options);

    expect(changes.at(-1)).toBe('#three');
    runtime.destroy();
  });
  it('updates active links for missing fragments without creating a scroll task', () => {
    const { runtime, values, changes, frames } = setup();
    runtime.scrollTo('#missing');

    expect(values.at(-1)).toBe('#missing');
    expect(changes.at(-1)).toBe('#missing');
    expect(frames.size).toBe(0);
    runtime.scrollTo('https://example.org/');

    expect(changes.at(-1)).toBe('https://example.org/');
    expect(frames.size).toBe(0);
    runtime.destroy();
  });
});
