import { backTopProgress } from './float-button.engine';
import { scrollFrame } from './scroll.engine';
import type { BackTopTarget } from './float-button.types';

interface BackTopOptions {
  getTarget: () => BackTopTarget | null;
  visibilityHeight: number;
  showProgress: boolean;
}
export function createBackTopRuntime(view: Window, notify: (state: { visible: boolean; progress: number }) => void) {
  let active = true;
  let options: BackTopOptions;
  let target: BackTopTarget | null = null;
  let scrollFrameId: number | undefined;
  let resizeFrameId: number | undefined;
  let animationFrame: number | undefined;
  let generation = 0;
  let progress = 0;
  let visible = false;
  function metrics(node: BackTopTarget | null) {
    if (!node) return { top: 0, height: 0, client: 0 };
    if ('window' in node) return { top: node.pageYOffset, height: node.document.documentElement.scrollHeight, client: node.document.documentElement.clientHeight };
    const element = 'documentElement' in node ? node.documentElement : node;
    return { top: element.scrollTop, height: element.scrollHeight, client: element.clientHeight };
  }
  function publish(nextVisible: boolean, nextProgress: number) {
    if (!active) return;
    visible = nextVisible; progress = nextProgress;
    notify({ visible, progress });
  }
  function sync() {
    if (!active) return;
    const state = metrics(target);
    publish(state.top >= options.visibilityHeight, options.showProgress ? backTopProgress(state.top, state.height, state.client) : progress);
  }
  function scheduleScroll() {
    if (active && scrollFrameId === undefined) scrollFrameId = view.requestAnimationFrame(() => { scrollFrameId = undefined; sync(); });
  }
  function scheduleResize() {
    if (active && options.showProgress && resizeFrameId === undefined) resizeFrameId = view.requestAnimationFrame(() => {
      resizeFrameId = undefined;
      if (!active) return;
      const state = metrics(options.getTarget());
      publish(visible, backTopProgress(state.top, state.height, state.client));
    });
  }
  function cancelMeasurement() {
    if (scrollFrameId !== undefined) view.cancelAnimationFrame(scrollFrameId);
    if (resizeFrameId !== undefined) view.cancelAnimationFrame(resizeFrameId);
    scrollFrameId = undefined; resizeFrameId = undefined;
  }
  function cancelAnimation() { generation++; if (animationFrame !== undefined) view.cancelAnimationFrame(animationFrame); animationFrame = undefined; }
  return {
    configure(next: BackTopOptions) {
      if (!active) return;
      cancelMeasurement();
      target?.removeEventListener('scroll', scheduleScroll);
      view.removeEventListener('resize', scheduleResize);
      options = next;
      target = options.getTarget();
      target?.addEventListener('scroll', scheduleScroll, { passive: true });
      if (options.showProgress) view.addEventListener('resize', scheduleResize);
      sync();
    },
    scrollToTop(duration: number) {
      if (!active || !options) return;
      const container = options.getTarget();
      if (!container) return;
      cancelAnimation();
      const top = metrics(container).top;
      const scroll = (value: number) => {
        if ('window' in container) container.scrollTo(container.pageXOffset, value);
        else ('documentElement' in container ? container.documentElement : container).scrollTop = value;
      };
      if (view.matchMedia('(prefers-reduced-motion: reduce)').matches || duration <= 0) { scroll(0); return; }
      const started = Date.now();
      const revision = generation;
      const frame = () => {
        if (!active || generation !== revision) return;
        const elapsed = Date.now() - started;
        scroll(scrollFrame(elapsed, top, 0, duration));
        if (elapsed < duration) animationFrame = view.requestAnimationFrame(frame); else animationFrame = undefined;
      };
      animationFrame = view.requestAnimationFrame(frame);
    },
    destroy() { active = false; cancelMeasurement(); cancelAnimation(); target?.removeEventListener('scroll', scheduleScroll); view.removeEventListener('resize', scheduleResize); target = null; }
  };
}
