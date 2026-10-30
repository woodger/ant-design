import type { Snippet } from 'svelte';

export type SpinSize = 'small' | 'medium' | 'large';

/** Standalone или вложенный индикатор ожидания с задержкой и блокировкой busy children. */
export interface SpinProps {
  /** @defaultValue true */
  spinning?: boolean;
  /** @defaultValue 0 */
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
