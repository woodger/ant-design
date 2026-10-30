import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type AffixTarget = Window | HTMLElement;
export type AffixUpdatePosition = (() => void) & { cancel: () => void };
export interface AffixProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
  children?: Snippet;
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => AffixTarget | null;
  onChange?: (affixed?: boolean) => void;
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
}
export interface AffixPosition {
  edge: 'top' | 'bottom';
  offset: number;
  width: number;
  height: number;
}
