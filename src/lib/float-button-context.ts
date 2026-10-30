import { getContext, setContext } from 'svelte';
import type { ButtonSlots } from './button.types';
import type { FloatButtonShape } from './float-button.types';
export interface FloatButtonContext {
  readonly shape: FloatButtonShape;
  readonly individual: boolean;
  readonly classNames: ButtonSlots;
  readonly styles: ButtonSlots;
}
const key = Symbol('ant-float-button');
export function provideFloatButton(context: FloatButtonContext) {
  setContext(key, context);
}
export function useFloatButton() {
  return getContext<FloatButtonContext | undefined>(key);
}
