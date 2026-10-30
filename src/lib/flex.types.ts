import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type FlexAlign = 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'baseline' | 'normal' | 'stretch';
export type FlexJustify = 'flex-start' | 'flex-end' | 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'normal' | 'left' | 'right';
export type FlexGap = 'small' | 'medium' | 'middle' | 'large' | string | number;

export interface FlexProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'style'> {
  children?: Snippet;
  orientation?: 'horizontal' | 'vertical';
  vertical?: boolean;
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: FlexJustify;
  align?: FlexAlign;
  flex?: string | number;
  gap?: FlexGap;
  component?: keyof HTMLElementTagNameMap;
  class?: string;
  rootClassName?: string;
  style?: string;
  nativeElement?: HTMLElement;
}
