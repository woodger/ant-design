import type { FloatButtonPlacement } from './float-button.types';
export function floatButtonPlacement(placement?: string): FloatButtonPlacement {
  return placement === 'bottom' || placement === 'left' || placement === 'right' ? placement : 'top';
}
export function backTopProgress(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const maximum = Math.max(scrollHeight - clientHeight, 0);
  return maximum > 0 ? Math.min(Math.max(scrollTop / maximum, 0), 1) : 0;
}
