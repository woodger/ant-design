import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { SpaceOrientation, SpaceProps } from './space.types';

export type SpaceCompactSize = ComponentSize | 'medium';
export interface SpaceCompactProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
  items?: SpaceProps['items'];
  children?: Snippet;
  size?: SpaceCompactSize;
  orientation?: SpaceOrientation;
  vertical?: boolean;
  direction?: SpaceOrientation;
  block?: boolean;
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
}
export interface SpaceAddonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'style'> {
  children?: Snippet;
  variant?: 'outlined' | 'filled' | 'borderless' | 'underlined';
  disabled?: boolean;
  status?: 'error' | 'warning';
  class?: string;
  style?: string;
  nativeElement?: HTMLDivElement;
}
