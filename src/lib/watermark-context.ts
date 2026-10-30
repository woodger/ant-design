import { getContext, setContext, untrack } from 'svelte';

export interface WatermarkContext {
  add(element: HTMLElement): void;
  remove(element: HTMLElement): void;
}

const watermarkKey = Symbol('ant-watermark');
export function provideWatermark(context: WatermarkContext) {
  setContext(watermarkKey, context);
}

export function useWatermarkPanel() {
  const context = getContext<WatermarkContext | undefined>(watermarkKey);
  return (element: HTMLElement) => {
    untrack(() => context?.add(element));
    return () => {
      untrack(() => context?.remove(element));
    };
  };
}
