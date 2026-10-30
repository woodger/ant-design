import { getContext, setContext } from 'svelte';
export interface StepsComposition {
  readonly railFollowPrevStatus: boolean;
  readonly timeline: boolean;
}
const key = Symbol('ant-steps-composition');
export function setStepsComposition(context: StepsComposition) { setContext(key, context); }
export function useStepsComposition() { return getContext<StepsComposition | undefined>(key); }
