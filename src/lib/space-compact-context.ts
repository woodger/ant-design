import { getContext, setContext } from 'svelte';
import type { SpaceCompactSize } from './space-compact.types';
import type { SpaceOrientation } from './space.types';

export interface SpaceCompactContext {
  readonly size?: SpaceCompactSize;
  readonly orientation: SpaceOrientation;
  readonly first: boolean;
  readonly last: boolean;
}
const compactKey = Symbol('ant-space-compact');
export function useCompact(): SpaceCompactContext | null { return getContext<SpaceCompactContext | null>(compactKey) ?? null; }
export function provideCompact(context: SpaceCompactContext | null) { setContext(compactKey, context); }
