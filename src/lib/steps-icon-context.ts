import { getContext, setContext } from 'svelte';
export interface StepsIconContext {
  readonly className?: string;
  readonly style?: string;
  readonly decorative: boolean;
}
const key = Symbol('ant-steps-icon');
export function setStepsIcon(context: StepsIconContext) {
  setContext(key, context);
}
export function useStepsIcon() {
  return getContext<StepsIconContext | undefined>(key);
}
