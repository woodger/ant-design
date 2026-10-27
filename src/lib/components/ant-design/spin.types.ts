import type { Snippet } from 'svelte';

export type SpinSize = 'small' | 'medium' | 'large';

export interface SpinProps {
  spinning?: boolean;
  delay?: number;
  size?: SpinSize;
  description?: string | Snippet;
  indicator?: Snippet;
  children?: Snippet;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  class?: string;
  style?: string;
}
